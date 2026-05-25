const pool = require('../config/db');

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
        null,
      ]
    );

    const medicalRecord = {
      child_id: Number(childId),
      visit_date: examinationDate,
      notes: notes || '',
      additional_data: {
        ...additionalData,
        ...(headCircumference == null ? {} : { head_circumference: Number(headCircumference) }),
      },
    };
    const growthChartRecord = {
      child_id: Number(childId),
      records: [
        {
          month: monthLabel(examinationDate),
          weight: Number(weight),
          height: Number(height),
          ...(headCircumference == null ? {} : { head_circumference: Number(headCircumference) }),
        },
      ],
    };

    return res.status(201).json({
      id: result.insertId,
      child_id: Number(childId),
      weight: Number(weight),
      height: Number(height),
      head_circumference: headCircumference == null ? null : Number(headCircumference),
      examination_date: examinationDate,
      nutrition_status: nutritionStatus || null,
      sql_table: 'examinations',
      nosql: {
        medical_records: medicalRecord,
        growth_charts: growthChartRecord,
        ...(Object.keys(dynamicData).length > 0 ? {
          dynamic_examinations: {
            child_id: Number(childId),
            exam_type: dynamicData.exam_type || 'tambahan',
            data: dynamicData.data || dynamicData,
          },
        } : {}),
      },
      message: 'Pemeriksaan utama tersimpan ke SQL. Catatan fleksibel disiapkan untuk NoSQL.',
    });
  } catch (error) {
    return next(error);
  }
}

function objectValue(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function monthLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return months[date.getMonth()];
}

module.exports = { listPemeriksaan, createPemeriksaan };
