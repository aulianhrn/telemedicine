require('../config/firebase');

const admin = require('firebase-admin');
const pool = require('../config/db');

const INVALID_FCM_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

async function registerDeviceToken(req, res, next) {
  try {
    const fcmToken = req.body.fcm_token || req.body.token;
    const platform = req.body.platform || 'android';

    if (!fcmToken) {
      return res.status(400).json({ message: 'fcm_token wajib diisi' });
    }

    await pool.query(
      `INSERT INTO device_tokens (pengguna_id, fcm_token, platform, is_active)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE
         pengguna_id = VALUES(pengguna_id),
         platform = VALUES(platform),
         is_active = 1,
         updated_at = CURRENT_TIMESTAMP`,
      [req.user.id, fcmToken, platform]
    );

    return res.json({ message: 'Device token berhasil disimpan' });
  } catch (error) {
    return next(error);
  }
}

async function unregisterDeviceToken(req, res, next) {
  try {
    const fcmToken = req.body.fcm_token || req.body.token;

    if (!fcmToken) {
      return res.status(400).json({ message: 'fcm_token wajib diisi' });
    }

    await pool.query(
      'UPDATE device_tokens SET is_active = 0 WHERE pengguna_id = ? AND fcm_token = ?',
      [req.user.id, fcmToken]
    );

    return res.json({ message: 'Device token berhasil dinonaktifkan' });
  } catch (error) {
    return next(error);
  }
}

async function listNotifications(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit || 30), 100);
    const offset = Math.max(Number(req.query.offset || 0), 0);
    const unreadOnly = req.query.unread_only === 'true' || req.query.unread_only === '1';

    const params = [req.user.id];
    let unreadWhere = '';

    if (unreadOnly) {
      unreadWhere = 'AND is_read = 0';
    }

    const [rows] = await pool.query(
      `SELECT id, judul, isi, tipe, data_json, event_key, is_read, created_at
       FROM notifikasi
       WHERE pengguna_id = ?
       ${unreadWhere}
       ORDER BY created_at DESC, id DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[unreadCountRow]] = await pool.query(
      'SELECT COUNT(*) AS unread_count FROM notifikasi WHERE pengguna_id = ? AND is_read = 0',
      [req.user.id]
    );

    return res.json({
      unread_count: Number(unreadCountRow.unread_count || 0),
      data: rows.map(mapNotificationRow),
    });
  } catch (error) {
    return next(error);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const [result] = await pool.query(
      'UPDATE notifikasi SET is_read = 1 WHERE id = ? AND pengguna_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    }

    return res.json({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (error) {
    return next(error);
  }
}

async function markAllNotificationsRead(req, res, next) {
  try {
    await pool.query(
      'UPDATE notifikasi SET is_read = 1 WHERE pengguna_id = ? AND is_read = 0',
      [req.user.id]
    );

    return res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (error) {
    return next(error);
  }
}

async function processNotificationEvents(req, res, next) {
  let connection;

  try {
    const limit = Math.min(Number(req.body.limit || req.query.limit || 20), 100);
    connection = await pool.getConnection();

    const [events] = await connection.query(
      `SELECT ne.*, a.nama AS nama_anak, i.pengguna_id
       FROM notification_events ne
       JOIN anak a ON a.id = ne.anak_id
       JOIN ibu i ON i.id = a.ibu_id
       WHERE ne.status = 'pending'
       ORDER BY ne.created_at ASC, ne.id ASC
       LIMIT ?`,
      [limit]
    );

    const results = [];

    for (const event of events) {
      const result = await processSingleEvent(connection, event);
      results.push(result);
    }

    return res.json({
      processed: results.filter((item) => item.status === 'processed').length,
      failed: results.filter((item) => item.status === 'failed').length,
      skipped: results.filter((item) => item.status === 'skipped').length,
      results,
    });
  } catch (error) {
    return next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function processSingleEvent(connection, event) {
  try {
    const [lockResult] = await connection.query(
      "UPDATE notification_events SET status = 'processing', error_message = NULL WHERE id = ? AND status = 'pending'",
      [event.id]
    );

    if (lockResult.affectedRows === 0) {
      return { id: event.id, status: 'skipped' };
    }

    const notification = buildNotification(event);

    await connection.query(
      `INSERT INTO notifikasi (pengguna_id, judul, isi, tipe, data_json, event_key)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         judul = VALUES(judul),
         isi = VALUES(isi),
         tipe = VALUES(tipe),
         data_json = VALUES(data_json)`,
      [
        event.pengguna_id,
        notification.title,
        notification.body,
        event.event_type,
        JSON.stringify(notification.data),
        notification.eventKey,
      ]
    );

    const [tokenRows] = await connection.query(
      'SELECT fcm_token FROM device_tokens WHERE pengguna_id = ? AND is_active = 1',
      [event.pengguna_id]
    );

    const tokens = tokenRows.map((row) => row.fcm_token);
    const sendResult = tokens.length > 0
      ? await sendPushNotification(tokens, notification)
      : { successCount: 0, failureCount: 0, invalidTokens: [] };

    if (sendResult.invalidTokens.length > 0) {
      await connection.query(
        'UPDATE device_tokens SET is_active = 0 WHERE fcm_token IN (?)',
        [sendResult.invalidTokens]
      );
    }

    await connection.query(
      "UPDATE notification_events SET status = 'processed', processed_at = CURRENT_TIMESTAMP, error_message = NULL WHERE id = ?",
      [event.id]
    );

    return {
      id: event.id,
      status: 'processed',
      tokens: tokens.length,
      sent: sendResult.successCount,
      failed: sendResult.failureCount,
    };
  } catch (error) {
    await connection.query(
      "UPDATE notification_events SET status = 'failed', error_message = ? WHERE id = ?",
      [error.message, event.id]
    );

    return { id: event.id, status: 'failed', error: error.message };
  }
}

function buildNotification(event) {
  const payload = parseJson(event.payload_json);
  const namaAnak = event.nama_anak || 'anak';
  const baseData = {
    event_id: String(event.id),
    event_type: event.event_type,
    source_table: event.source_table,
    source_id: String(event.source_id),
    anak_id: String(event.anak_id),
    ...stringifyDataValues(payload),
  };

  if (event.event_type === 'imunisasi_created') {
    return {
      title: 'Jadwal imunisasi baru',
      body: `Jadwal ${payload.nama_vaksin || 'imunisasi'} untuk ${namaAnak} telah dibuat.`,
      data: baseData,
      eventKey: notificationEventKey(event, event.pengguna_id),
    };
  }

  if (event.event_type === 'imunisasi_updated') {
    return {
      title: 'Jadwal imunisasi diperbarui',
      body: `Jadwal ${payload.nama_vaksin || 'imunisasi'} untuk ${namaAnak} telah diperbarui.`,
      data: baseData,
      eventKey: notificationEventKey(event, event.pengguna_id),
    };
  }

  if (event.event_type === 'pemeriksaan_created') {
    return {
      title: 'Hasil pemeriksaan baru',
      body: `Hasil pemeriksaan ${namaAnak} sudah tersedia.`,
      data: baseData,
      eventKey: notificationEventKey(event, event.pengguna_id),
    };
  }

  if (event.event_type === 'pemeriksaan_updated') {
    return {
      title: 'Hasil pemeriksaan diperbarui',
      body: `Hasil pemeriksaan ${namaAnak} telah diperbarui.`,
      data: baseData,
      eventKey: notificationEventKey(event, event.pengguna_id),
    };
  }

  return {
    title: 'Notifikasi baru',
    body: `Ada pembaruan data untuk ${namaAnak}.`,
    data: baseData,
    eventKey: notificationEventKey(event, event.pengguna_id),
  };
}

async function sendPushNotification(tokens, notification) {
  const response = await admin.messaging().sendEachForMulticast({
    tokens,
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data,
    android: {
      priority: 'high',
      notification: {
        channelId: 'default',
        sound: 'default',
      },
    },
  });

  const invalidTokens = [];

  response.responses.forEach((item, index) => {
    if (!item.success && INVALID_FCM_TOKEN_CODES.has(item.error?.code)) {
      invalidTokens.push(tokens[index]);
    }
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    invalidTokens,
  };
}

function mapNotificationRow(row) {
  return {
    ...row,
    is_read: Boolean(row.is_read),
    data: parseJson(row.data_json),
    data_json: undefined,
  };
}

function parseJson(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return {};
  }
}

function stringifyDataValues(data) {
  return Object.fromEntries(
    Object.entries(data || {}).map(([key, value]) => [key, value == null ? '' : String(value)])
  );
}

function notificationEventKey(event, penggunaId) {
  return `${event.event_type}:${event.source_table}:${event.source_id}:${penggunaId}`;
}

module.exports = {
  registerDeviceToken,
  unregisterDeviceToken,
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  processNotificationEvents,
};
