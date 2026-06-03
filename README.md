# Telemedicine Posyandu Backend

Backend Express.js untuk aplikasi Flutter Posyandu. Backend ini memakai Cloud SQL MySQL untuk data utama, Google Cloud Storage untuk foto avatar, Firebase/Firestore untuk kebutuhan NoSQL, Cloud Build untuk build image, dan Cloud Run untuk menjalankan API. Di Cloud Run, koneksi database disarankan memakai Cloud SQL Unix socket.

## Struktur Penting

- `backend/server.js`: entry point Express.
- `backend/config/db.js`: koneksi Cloud SQL MySQL.
- `backend/config/firebase.js`: inisialisasi Firebase Admin / Firestore.
- `backend/middleware/uploadAvatar.js`: middleware upload avatar memakai memory upload.
- `backend/utils/cloudStorage.js`: upload, hapus, dan download avatar dari Cloud Storage.
- `backend/utils/avatarFileStore.js`: serve URL `/uploads/...` dari Cloud Storage, dengan fallback database.
- `Dockerfile`: image backend untuk Cloud Run.
- `cloudbuild.yaml`: pipeline Cloud Build untuk build, push, dan deploy Cloud Run.
- `.env.example`: template konfigurasi lokal.
- `backend/.env`: konfigurasi lokal aktif, tidak untuk commit.

## Setup Lokal

Masuk ke folder backend aplikasi:

```bash
cd backend
npm install
```

Salin template env dari root repo ke folder backend:

```bash
copy ..\.env.example .env
```

Isi nilai penting:

```env
PORT=3000
JWT_SECRET=ganti_dengan_secret_yang_panjang
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=telemed
DB_PASSWORD=ganti_password_database
DB_NAME=telemedicine_posyandu
DB_SSL=false
DB_SOCKET_PATH=
GCS_BUCKET_NAME=telemedicine-posyandu-avatar
```

Jalankan:

```bash
npm run dev
```

Health check:

```txt
GET http://localhost:3000/health
```

## Cloud SQL MySQL

Database utama aplikasi berada di Cloud SQL MySQL. Untuk Cloud Run, backend dikonfigurasi memakai Cloud SQL Unix socket supaya database tidak perlu diakses lewat public IP.

Format Cloud SQL instance connection name:

```txt
PROJECT_ID:REGION:INSTANCE_ID
```

Contoh:

```txt
praktikum-tcc01:us-central1:telemedicine-posyandu
```

Nilai socket path yang dibaca backend:

```env
DB_SOCKET_PATH=/cloudsql/PROJECT_ID:REGION:INSTANCE_ID
```

Saat `DB_SOCKET_PATH` diisi, kode akan mengabaikan `DB_HOST` dan `DB_PORT`.

Env database yang dipakai:

```env
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=telemedicine_posyandu
DB_SSL=false
DB_SOCKET_PATH=/cloudsql/PROJECT_ID:REGION:INSTANCE_ID
```

Untuk local development, ada dua pilihan:

- Pakai public IP Cloud SQL langsung di `DB_HOST`, dengan `DB_SSL=true` jika koneksi membutuhkan TLS.
- Pakai Cloud SQL Auth Proxy, lalu set `DB_HOST=127.0.0.1` dan `DB_SSL=false`.

Untuk Cloud Run, lakukan dua hal:

1. Tambahkan Cloud SQL instance ke service Cloud Run.
2. Set `DB_SOCKET_PATH=/cloudsql/PROJECT_ID:REGION:INSTANCE_ID`.

Di repo ini, `cloudbuild.yaml` sudah memakai:

```yaml
--add-cloudsql-instances
$_CLOUD_SQL_INSTANCE
--set-env-vars
DB_SOCKET_PATH=/cloudsql/$_CLOUD_SQL_INSTANCE,...
```

Ganti substitution `_CLOUD_SQL_INSTANCE` di `cloudbuild.yaml` dengan instance connection name asli dari Cloud SQL kamu.

## Cloud Storage Avatar

Foto avatar sekarang disimpan ke Google Cloud Storage, bukan ke folder lokal. Bucket yang dipakai di env:

```env
GCS_BUCKET_NAME=telemedicine-posyandu-avatar
```

Alur upload:

- Client mengirim multipart file field `ava_pict`.
- `multer.memoryStorage()` menyimpan file sementara di memory request.
- Backend membuat path seperti `/uploads/profile/xxx.jpg` atau `/uploads/anak/xxx.jpg`.
- File diupload ke object Cloud Storage dengan object name `profile/xxx.jpg` atau `anak/xxx.jpg`.
- Database tetap menyimpan path `/uploads/...` agar respons API tetap kompatibel dengan frontend lama.
- Saat URL `/uploads/...` dibuka, backend mengambil file dari Cloud Storage dan mengirimkannya ke client.

Bucket tidak wajib public karena file disajikan lewat backend. Service account runtime Cloud Run harus punya role:

```txt
Storage Object Admin
```

Principal yang kamu pilih untuk sekarang:

```txt
255520032221-compute@developer.gserviceaccount.com
```

Itu adalah Compute Engine default service account yang biasanya dipakai Cloud Run jika runtime service account belum diganti.

## Firebase dan Firestore

File `backend/config/firebase.js` mendukung tiga cara credential:

1. Env `FIREBASE_SERVICE_ACCOUNT_JSON`.
2. File lokal `backend/serviceAccountKey.json`.
3. Application Default Credentials.

Untuk local development, cara termudah adalah menaruh file Firebase Admin SDK key:

```txt
backend/serviceAccountKey.json
```

File ini sudah masuk `.gitignore`, jadi jangan commit ke GitHub.

Untuk Cloud Run, cara yang lebih aman adalah menyimpan JSON Firebase di Secret Manager, lalu inject sebagai env:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Catatan arsitektur hybrid:

- Cloud SQL menyimpan data utama seperti pengguna, ibu, anak, imunisasi, pemeriksaan, dan avatar path.
- Firestore/Firebase dipakai untuk kebutuhan NoSQL seperti catatan fleksibel, growth chart, dynamic examination, dan fitur mobile yang butuh skema lebih lentur.

## IAM dan Service Account

Ada beberapa service account yang perannya berbeda:

- Compute Engine default service account: runtime identity Cloud Run jika belum diganti.
- Cloud Build service account: menjalankan build, push image, dan deploy.
- Cloud Run Service Agent: service agent internal Google, bukan akun aplikasi backend.
- Firestore/Firebase service account: credential Firebase Admin jika memakai file `serviceAccountKey.json`.

Untuk konfigurasi saat ini, berikan akses bucket avatar ke:

```txt
255520032221-compute@developer.gserviceaccount.com
```

Role:

```txt
Storage Object Admin
```

Karena Cloud Run memakai Cloud SQL Unix socket, runtime service account Cloud Run perlu:

```txt
Cloud SQL Client
```

Untuk konfigurasi sekarang, tambahkan role itu ke runtime service account yang sama dengan backend, yaitu jika belum diganti:

```txt
255520032221-compute@developer.gserviceaccount.com
```

Cloud Build service account tetap butuh izin untuk:

- Build Docker image.
- Push image ke Container Registry.
- Deploy Cloud Run service.

Mengubah atau menambah izin runtime service account tidak otomatis merusak trigger Cloud Build.

## Cloud Build dan Cloud Run

Pipeline deployment ada di `cloudbuild.yaml`:

1. Build Docker image dari `Dockerfile`.
2. Push image ke `gcr.io/$PROJECT_ID/telemedicine-backend`.
3. Deploy image ke Cloud Run service `backend`.

Env Cloud Run diset langsung di bagian `--set-env-vars`:

```yaml
--add-cloudsql-instances
$_CLOUD_SQL_INSTANCE
--set-env-vars
DB_SOCKET_PATH=/cloudsql/$_CLOUD_SQL_INSTANCE,DB_PORT=3306,DB_USER=...,DB_PASSWORD=...,DB_NAME=telemedicine_posyandu,DB_SSL=false,JWT_SECRET=...,GCS_BUCKET_NAME=telemedicine-posyandu-avatar
``

## Endpoint Utama

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `PATCH /api/auth/me/password`
- `POST /api/auth/me/avatar`
- `PATCH /api/auth/me/avatar`
- `GET /api/dashboard`
- `GET /api/anak`
- `POST /api/anak`
- `GET /api/anak/:id`
- `POST /api/anak/:id/avatar`
- `PATCH /api/anak/:id/avatar`
- `GET /api/imunisasi`
- `POST /api/imunisasi`
- `PATCH /api/imunisasi/:id/status`
- `GET /api/pemeriksaan`
- `POST /api/pemeriksaan`
- `GET /api/notifications`
- `POST /api/notifications/device-token`

Alias endpoint untuk skenario SQL berbahasa Inggris:

- `GET /api/immunizations`
- `POST /api/immunizations`
- `GET /api/examinations`
- `POST /api/examinations`

## Upload Avatar

Field multipart yang digunakan:

```txt
ava_pict
```

Endpoint foto ibu:

```txt
POST /api/auth/me/avatar
PATCH /api/auth/me/avatar
```

Endpoint foto anak:

```txt
POST /api/anak/:id/avatar
PATCH /api/anak/:id/avatar
```

Respons mengembalikan:

```json
{
  "ava_pict": "/uploads/profile/filename.jpg",
  "ava_pict_url": "https://backend-url/uploads/profile/filename.jpg"
}
```

Walaupun URL terlihat seperti file backend, file aslinya berada di Cloud Storage.

## Catatan Keamanan

- Jangan commit `backend/.env`.
- Jangan commit `backend/serviceAccountKey.json`.
- Untuk production, pindahkan password database, JWT secret, dan Firebase JSON ke Secret Manager.
- Hindari membuat bucket backup SQL public.
- Avatar bisa tetap private karena backend yang melakukan serve file dari bucket.
