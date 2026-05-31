const pool = require('../config/db');
const firestore = require('../config/firebase');

function normalizePemeriksaan(row) {
  return {
    ...row,
    child_id: row.anak_id,
    weight: row.berat_badan,
    height: row.tinggi_badan,
    head_circumference: row.lingkar_kepala,
    nutrition_status: row.status_gizi,
    examination_date: row.tanggal_pemeriksaan,
    notes: row.catatan,
  };
}

async function listPemeriksaan(req, res, next) {
  try {
    const params = [];
    let where = '';

    const childId = req.query.child_id || req.query.anak_id;

    if (childId) {
      where = 'WHERE pm.anak_id = ?';
      params.push(childId);
    } else if (req.user.role === 'ibu' && req.user.ibuId) {
      where = 'WHERE a.ibu_id = ?';
      params.push(req.user.ibuId);
    }

    const [rows] = await pool.query(
      `SELECT pm.*, a.nama AS nama_anak, pb.nama AS nama_bidan
       FROM pemeriksaan pm
       JOIN anak a ON a.id = pm.anak_id
       JOIN bidan b ON b.id = pm.bidan_id
       JOIN pengguna pb ON pb.id = b.pengguna_id
       ${where}
       ORDER BY pm.tanggal_pemeriksaan DESC, pm.id DESC`,
      params
    );

    return res.json(rows.map(normalizePemeriksaan));
  } catch (error) {
    return next(error);
  }
}

async function createPemeriksaan(req, res, next) {
  try {
    const childId = req.body.child_id || req.body.anak_id;
    const bidanId = req.body.bidan_id;
    const weight = req.body.weight ?? req.body.berat_badan;
    const height = req.body.height ?? req.body.tinggi_badan;
    const headCircumference = req.body.head_circumference ?? req.body.lingkar_kepala;
    const nutritionStatus = req.body.nutrition_status ?? req.body.status_gizi;
    const examinationDate = req.body.examination_date ?? req.body.tanggal_pemeriksaan;
    const notes = req.body.notes ?? req.body.catatan;
    const additionalData = objectValue(req.body.additional_data ?? req.body.data_tambahan);
    const dynamicData = objectValue(req.body.dynamic_data ?? req.body.data_dinamis);
    const zScoreData = objectValue(req.body.z_score);
    const formVersion = req.body.form_version || 'v1';

    const targetBidanId = req.user.role === 'bidan' ? req.user.bidanId : bidanId;

    if (!childId || !targetBidanId || weight == null || height == null || !examinationDate) {
      return res.status(400).json({
        message: 'child_id, bidan_id, weight, height, dan examination_date wajib diisi',
      });
    }

    const [result] = await pool.query(
      `INSERT INTO pemeriksaan
       (anak_id, bidan_id, berat_badan, tinggi_badan, lingkar_kepala, status_gizi, tanggal_pemeriksaan, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        childId,
        targetBidanId,
        weight,
        height,
        headCircumference ?? null,
        nutritionStatus || null,
        examinationDate,
        notes || null,
      ]
    );

    const pemeriksaanId = result.insertId;
    const normalizedHeadCircumference = headCircumference == null ? null : Number(headCircumference);

    const medicalRecord = {
      child_id: Number(childId),
      examination_id: Number(pemeriksaanId),
      bidan_id: Number(targetBidanId),
      visit_date: examinationDate,
      nutrition_status: nutritionStatus || null,
      notes: notes || '',
      additional_data: {
        ...additionalData,
        head_circumference: normalizedHeadCircumference,
      },
      created_at: new Date(),
    };

    const visitNote = {
      child_id: Number(childId),
      examination_id: Number(pemeriksaanId),
      bidan_id: Number(targetBidanId),
      visit_date: examinationDate,
      summary: notes || '',
      complaints: additionalData.keluhan || null,
      allergies: Array.isArray(additionalData.alergi) ? additionalData.alergi : [],
      disease_history: additionalData.riwayat_penyakit || null,
      midwife_advice: additionalData.saran_bidan || null,
      created_at: new Date(),
    };

    const growthChartRecord = {
      child_id: Number(childId),
      examination_id: Number(pemeriksaanId),
      records: [
        {
          month: monthLabel(examinationDate),
          date: examinationDate,
          weight: Number(weight),
          height: Number(height),
          head_circumference: normalizedHeadCircumference,
          nutrition_status: nutritionStatus || null,
          z_score: zScoreData,
        },
      ],
      created_at: new Date(),
    };

    const examinationForm = {
      child_id: Number(childId),
      examination_id: Number(pemeriksaanId),
      form_version: formVersion,
      form_type: dynamicData.exam_type || 'tambahan',
      field_keys: Object.keys(dynamicData.data || dynamicData),
      supports_dynamic_fields: true,
      source: 'pemeriksaan',
      created_at: new Date(),
    };

    const dynamicExamination = {
      child_id: Number(childId),
      examination_id: Number(pemeriksaanId),
      bidan_id: Number(targetBidanId),
      exam_type: dynamicData.exam_type || 'tambahan',
      form_version: formVersion,
      data: dynamicData.data || dynamicData,
      created_at: new Date(),
    };

    const [
      medicalRecordRef,
      growthChartRef,
      visitNoteRef,
      dynamicExaminationRef,
      examinationFormRef,
    ] = await Promise.all([
      firestore.collection('medical_records').add(medicalRecord),
      firestore.collection('growth_charts').add(growthChartRecord),
      firestore.collection('visit_notes').add(visitNote),
      firestore.collection('dynamic_examinations').add(dynamicExamination),
      firestore.collection('examination_forms').add(examinationForm),
    ]);

    return res.status(201).json({
      id: pemeriksaanId,
      child_id: Number(childId),
      bidan_id: Number(targetBidanId),
      weight: Number(weight),
      height: Number(height),
      head_circumference: normalizedHeadCircumference,
      examination_date: examinationDate,
      nutrition_status: nutritionStatus || null,
      sql_table: 'pemeriksaan',
      nosql: {
        medical_records: {
          firestore_id: medicalRecordRef.id,
          ...medicalRecord,
        },
        growth_charts: {
          firestore_id: growthChartRef.id,
          ...growthChartRecord,
        },
        visit_notes: {
          firestore_id: visitNoteRef.id,
          ...visitNote,
        },
        dynamic_examinations: {
          firestore_id: dynamicExaminationRef.id,
          ...dynamicExamination,
        },
        examination_forms: {
          firestore_id: examinationFormRef.id,
          ...examinationForm,
        },
      },
      message: 'Pemeriksaan berhasil ditambahkan ke MySQL dan 5 collection Firestore',
    });
  } catch (error) {
    return next(error);
  }
}

async function getWeightChart(req, res, next) {
  try {
    const childId = req.params.childId || req.params.anakId || req.query.child_id || req.query.anak_id;

    if (!childId) {
      return res.status(400).json({ message: 'child_id wajib diisi' });
    }

    await ensureChildAccess(req, childId);
    const points = await getGrowthChartPoints(childId);

    return res.json({
      child_id: Number(childId),
      title: 'Grafik Berat Badan',
      unit: 'kg',
      data: points.map((point) => ({
        examination_id: point.examination_id,
        date: point.date,
        month: point.month,
        value: point.weight,
        weight: point.weight,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function getHeightChart(req, res, next) {
  try {
    const childId = req.params.childId || req.params.anakId || req.query.child_id || req.query.anak_id;

    if (!childId) {
      return res.status(400).json({ message: 'child_id wajib diisi' });
    }

    await ensureChildAccess(req, childId);
    const points = await getGrowthChartPoints(childId);

    return res.json({
      child_id: Number(childId),
      title: 'Grafik Tinggi Badan',
      unit: 'cm',
      data: points.map((point) => ({
        examination_id: point.examination_id,
        date: point.date,
        month: point.month,
        value: point.height,
        height: point.height,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function getNutritionStatusCard(req, res, next) {
  try {
    const childId = req.params.childId || req.params.anakId || req.query.child_id || req.query.anak_id;

    if (!childId) {
      return res.status(400).json({ message: 'child_id wajib diisi' });
    }

    await ensureChildAccess(req, childId);
    const points = await getGrowthChartPoints(childId);
    const latest = points[points.length - 1] || null;

    return res.json({
      child_id: Number(childId),
      title: 'Status Gizi dan Z-Score',
      data: latest ? nutritionCardFromPoint(latest) : null,
    });
  } catch (error) {
    return next(error);
  }
}

async function getMobileGrowthSummary(req, res, next) {
  try {
    const childId = req.params.childId || req.params.anakId || req.query.child_id || req.query.anak_id;

    if (!childId) {
      return res.status(400).json({ message: 'child_id wajib diisi' });
    }

    await ensureChildAccess(req, childId);
    const points = await getGrowthChartPoints(childId);
    const latest = points[points.length - 1] || null;

    return res.json({
      child_id: Number(childId),
      weight_chart: {
        title: 'Grafik Berat Badan',
        unit: 'kg',
        data: points.map((point) => ({
          examination_id: point.examination_id,
          date: point.date,
          month: point.month,
          value: point.weight,
          weight: point.weight,
        })),
      },
      height_chart: {
        title: 'Grafik Tinggi Badan',
        unit: 'cm',
        data: points.map((point) => ({
          examination_id: point.examination_id,
          date: point.date,
          month: point.month,
          value: point.height,
          height: point.height,
        })),
      },
      nutrition_status_card: {
        title: 'Status Gizi dan Z-Score',
        data: latest ? nutritionCardFromPoint(latest) : null,
      },
    });
  } catch (error) {
    return next(error);
  }
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

async function ensureChildAccess(req, childId) {
  if (req.user.role !== 'ibu' || !req.user.ibuId) {
    return;
  }

  const [rows] = await pool.query(
    'SELECT id FROM anak WHERE id = ? AND ibu_id = ? LIMIT 1',
    [childId, req.user.ibuId]
  );

  if (rows.length === 0) {
    const error = new Error('Anak tidak ditemukan atau tidak dapat diakses');
    error.status = 403;
    throw error;
  }
}

async function getGrowthChartPoints(childId) {
  const snapshot = await firestore
    .collection('growth_charts')
    .where('child_id', '==', Number(childId))
    .get();

  const points = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const records = Array.isArray(data.records) ? data.records : [];

    records.forEach((record) => {
      points.push({
        firestore_id: doc.id,
        examination_id: data.examination_id || record.examination_id || null,
        date: normalizeDate(record.date || data.date || data.created_at),
        month: record.month || monthLabel(record.date || data.created_at),
        weight: numberOrNull(record.weight),
        height: numberOrNull(record.height),
        head_circumference: numberOrNull(record.head_circumference),
        nutrition_status: record.nutrition_status || data.nutrition_status || null,
        z_score: objectValue(record.z_score || data.z_score),
      });
    });
  });

  return points.sort((a, b) => dateSortValue(a.date) - dateSortValue(b.date));
}

function nutritionCardFromPoint(point) {
  return {
    examination_id: point.examination_id,
    date: point.date,
    month: point.month,
    nutrition_status: point.nutrition_status,
    z_score: point.z_score,
    weight: point.weight,
    height: point.height,
    head_circumference: point.head_circumference,
  };
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString().slice(0, 10);
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

function dateSortValue(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function numberOrNull(value) {
  return value == null ? null : Number(value);
}

function monthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[date.getMonth()];
}

module.exports = {
  listPemeriksaan,
  createPemeriksaan,
  getWeightChart,
  getHeightChart,
  getNutritionStatusCard,
  getMobileGrowthSummary,
};
