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
- `GET /api/dashboard`
- `GET /api/anak`
- `POST /api/anak`
- `GET /api/imunisasi`
- `POST /api/imunisasi`
- `PATCH /api/imunisasi/:id/status`
- `GET /api/pemeriksaan`
- `POST /api/pemeriksaan`
