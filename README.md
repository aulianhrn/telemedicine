# 🏥 Backend Web Posyandu (Bidan/Admin)

Backend REST API untuk portal web bidan/admin.
Dibangun dengan **Node.js + Express + MySQL** — **sharing database** dengan backend mobile temenmu.

---

## 📐 Arsitektur

```
┌─────────────────┐        ┌──────────────────┐
│  Aplikasi Mobile│        │  Web (Bidan)     │
│  (Ibu/Pasien)   │        │  Frontend        │
└────────┬────────┘        └────────┬─────────┘
         │                          │
         ▼                          ▼
┌─────────────────┐        ┌──────────────────┐
│ Backend Mobile  │        │ Backend Web      │
│ (temenmu)       │        │ (ini)            │
│ port: 8080      │        │ port: 5000       │
└────────┬────────┘        └────────┬─────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌──────────────────────┐
         │  MySQL Database      │
         │  telemedicine_posyandu│
         └──────────────────────┘
```

---

## 📁 Struktur Folder

```
backend-web-v2/
├── src/
│   ├── server.js                  ← Entry point
│   ├── config/
│   │   ├── db.js                  ← Koneksi MySQL (identik temenmu)
│   │   └── seed.js                ← Buat akun bidan & admin
│   ├── middleware/
│   │   └── auth.js                ← JWT (identik temenmu)
│   ├── controllers/
│   │   ├── authController.js      ← Login, user management
│   │   ├── dashboardController.js ← Statistik
│   │   ├── anakController.js      ← CRUD anak + pemeriksaan + grafik
│   │   ├── ibuController.js       ← Data ibu
│   │   ├── imunisasiController.js ← Jadwal imunisasi
│   │   └── laporanController.js   ← Rekap + Export PDF
│   └── routes/
│       └── index.js               ← Semua endpoint
├── uploads/
├── .env.example
├── package.json
└── README.md
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
cd backend-web-v2
npm install
```

### 2. Buat file .env
```bash
cp .env.example .env
```

Isi `.env` dengan **credential yang SAMA dengan .env temenmu**:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=adminposyandu
DB_PASSWORD=pass123
DB_NAME=telemedicine_posyandu

JWT_SECRET=   ← HARUS SAMA PERSIS dengan temenmu!

PORT=5000
FRONTEND_URL=http://localhost:3000
```

> ⚠️ **JWT_SECRET harus sama** dengan temenmu supaya token mobile bisa dibaca web.

### 3. Buat akun bidan & admin
```bash
npm run seed
```

Akun default:
| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@posyandu.com | admin123 |
| Bidan | bidan@posyandu.com | bidan123 |

### 4. Jalankan server
```bash
npm run dev    # development
npm start      # production
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Akses |
|--------|----------|-------|
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Semua |
| PUT | /api/auth/change-password | Semua |
| GET | /api/auth/users | Admin |
| POST | /api/auth/users | Admin |

### Dashboard
| Method | Endpoint |
|--------|----------|
| GET | /api/dashboard |

### Anak
| Method | Endpoint |
|--------|----------|
| GET | /api/anak |
| GET | /api/anak/:id |
| POST | /api/anak |
| PUT | /api/anak/:id |
| DELETE | /api/anak/:id |
| POST | /api/anak/:id/pemeriksaan |
| GET | /api/anak/:id/grafik |

### Ibu
| Method | Endpoint |
|--------|----------|
| GET | /api/ibu |
| GET | /api/ibu/:id |
| PUT | /api/ibu/:id |

### Imunisasi
| Method | Endpoint |
|--------|----------|
| GET | /api/imunisasi |
| POST | /api/imunisasi |
| PATCH | /api/imunisasi/:id/status |
| PUT | /api/imunisasi/:id/selesai |
| DELETE | /api/imunisasi/:id |

### Laporan
| Method | Endpoint |
|--------|----------|
| GET | /api/laporan/rekap-bulanan?bulan=1&tahun=2025 |
| POST | /api/laporan/simpan |
| GET | /api/laporan/export-pdf?bulan=1&tahun=2025 |

---

## 🔐 Auth Header
```
Authorization: Bearer <token>
```
