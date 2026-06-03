# Telemedicine Posyandu Backend

Backend Express.js untuk aplikasi Flutter Posyandu Kita.

## Setup

1. Masuk ke folder backend.
   ```bash
   cd backend
   ```

2. Install dependency.
   ```bash
   npm install
   ```

3. Salin konfigurasi environment.
   ```bash
   copy .env.example .env
   ```

4. Isi `DB_HOST` dengan host Cloud SQL MySQL kamu. Jika memakai Cloud SQL Auth Proxy lokal, biarkan `DB_HOST=127.0.0.1`.

5. Jalankan backend.
   ```bash
   npm run dev
   ```

## Endpoint Utama

- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `PATCH /api/auth/me/password`
- `POST /api/auth/me/avatar`
- `GET /api/dashboard`
- `GET /api/anak`
- `POST /api/anak`
- `GET /api/imunisasi`
- `POST /api/imunisasi`
- `PATCH /api/imunisasi/:id/status`
- `GET /api/pemeriksaan`
- `POST /api/pemeriksaan`
- `GET /api/immunizations` alias untuk skenario SQL `immunizations`
- `POST /api/immunizations` alias untuk skenario SQL `immunizations`
- `GET /api/examinations` alias untuk skenario SQL `examinations`
- `POST /api/examinations` alias untuk skenario SQL `examinations`

## Pembagian SQL dan NoSQL

- Pemeriksaan bulanan: data terstruktur disimpan ke SQL lewat `POST /api/examinations`, sedangkan catatan fleksibel disimpan mobile ke Firestore collection `medical_records`.
- Grafik pertumbuhan: mobile membaca Firestore collection `growth_charts`.
- Catatan tambahan pemeriksaan: mobile menyimpan field dinamis ke Firestore collection `dynamic_examinations`.
- Jadwal imunisasi: data disimpan ke SQL lewat `POST /api/immunizations`.
