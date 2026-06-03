# Telemedicine Posyandu Backend

Backend ini adalah API Express.js untuk aplikasi Flutter Posyandu. Sistemnya memakai arsitektur hybrid: data operasional utama disimpan di Cloud SQL MySQL, file avatar disimpan di Google Cloud Storage, dan kebutuhan data fleksibel/mobile disiapkan lewat Firebase/Firestore.

## Gambaran Aplikasi

Aplikasi menangani workflow dasar Posyandu:

- Autentikasi pengguna ibu .
- Profil ibu dan data anak.
- Dashboard ringkasan pertumbuhan dan status anak.
- Jadwal dan status imunisasi.
- Pemeriksaan bulanan seperti berat badan, tinggi badan, lingkar kepala, dan status gizi.
- Notifikasi dan device token untuk kebutuhan mobile.

Backend menyediakan REST API untuk Flutter. Sebagian endpoint berbahasa Indonesia (`/api/imunisasi`, `/api/pemeriksaan`) dan sebagian alias berbahasa Inggris (`/api/immunizations`, `/api/examinations`) disediakan agar kompatibel dengan skenario SQL/NoSQL yang berbeda.

## Teknologi

Teknologi utama yang dipakai:

- **Node.js + Express.js** sebagai backend REST API.
- **MySQL** sebagai database relasional.
- **Google Cloud SQL** sebagai managed MySQL di GCP.
- **Google Cloud Run** sebagai runtime container backend.
- **Google Cloud Build** sebagai pipeline build dan deploy otomatis.
- **Google Container Registry** (`gcr.io`) sebagai registry image Docker.
- **Google Cloud Storage** sebagai penyimpanan file avatar.
- **Firebase Admin SDK** untuk akses Firebase/Firestore dari backend.
- **Firestore** untuk kebutuhan NoSQL dan data mobile yang lebih fleksibel.
- **JWT** untuk autentikasi API.
- **Multer** untuk menerima upload file avatar dari multipart form.

## Arsitektur GCP

Alur deployment backend:

1. Source code dipush ke repository yang terhubung dengan Cloud Build Trigger.
2. Cloud Build membaca `cloudbuild.yaml`.
3. Docker image dibuat dari `Dockerfile`.
4. Image dipush ke `gcr.io/$PROJECT_ID/telemedicine-backend`.
5. Cloud Build menjalankan `gcloud run deploy`.
6. Cloud Run menjalankan container backend sebagai service bernama `backend`.

File penting:

- `Dockerfile`: definisi image backend.
- `cloudbuild.yaml`: instruksi build, push, dan deploy Cloud Run.
- `backend/server.js`: entry point aplikasi Express.
- `backend/config/db.js`: konfigurasi koneksi MySQL.
- `backend/config/firebase.js`: konfigurasi Firebase Admin.
- `backend/utils/cloudStorage.js`: integrasi Google Cloud Storage.

## Cloud Run

Cloud Run menjalankan backend sebagai container HTTP. Service ini menerima request dari aplikasi Flutter dan meneruskannya ke route Express.

Konfigurasi Cloud Run yang penting:

- Port container: `8080`
- Service name: `backend`
- Region di konfigurasi saat ini: `us-central1`
- Public access: `--allow-unauthenticated`
- Runtime service account: service account yang dipakai backend saat mengakses Cloud SQL dan Cloud Storage.

Environment variable Cloud Run diset dari `cloudbuild.yaml`, bukan dari file `.env` lokal.

## Cloud Build dan Trigger

Cloud Build dipakai untuk CI/CD. Trigger akan menjalankan deployment otomatis saat ada push ke branch yang dikonfigurasi.

Pipeline di `cloudbuild.yaml` berisi:

- Build image:
  ```txt
  docker build -t gcr.io/$PROJECT_ID/telemedicine-backend .
  ```
- Push image:
  ```txt
  docker push gcr.io/$PROJECT_ID/telemedicine-backend
  ```
- Deploy Cloud Run:
  ```txt
  gcloud run deploy backend
  ```

Cloud Build service account berbeda dari runtime service account Cloud Run. Cloud Build service account bertugas membangun dan mendeploy image, sedangkan runtime service account dipakai aplikasi saat berjalan.

## Cloud SQL MySQL

Cloud SQL MySQL menyimpan data utama aplikasi, seperti:

- `pengguna`
- `ibu`
- `bidan`
- `anak`
- `imunisasi`
- `pemeriksaan`
- path avatar
- data notifikasi/device token jika ada di skema SQL

Di Cloud Run, backend dikonfigurasi memakai **Cloud SQL Unix socket**. Dengan cara ini backend tidak perlu mengakses database lewat public IP.

Format instance connection name:

```txt
PROJECT_ID:REGION:INSTANCE_ID
```

Di `cloudbuild.yaml`, nilai ini diwakili oleh substitution:

```yaml
substitutions:
  _CLOUD_SQL_INSTANCE: 'praktikum-tcc01:us-central1:mysql-posyandu'
```

Cloud Run menghubungkan instance dengan:

```yaml
--add-cloudsql-instances
$_CLOUD_SQL_INSTANCE
```

Backend menerima socket path:

```env
DB_SOCKET_PATH=/cloudsql/praktikum-tcc01:us-central1:mysql-posyandu
```

Saat `DB_SOCKET_PATH` aktif, kode di `backend/config/db.js` memakai `socketPath` dan mengabaikan `DB_HOST` serta `DB_PORT`.

## Cloud Storage Avatar

Google Cloud Storage dipakai untuk menyimpan foto avatar ibu dan anak.

Bucket yang dipakai:

```env
GCS_BUCKET_NAME=telemedicine-posyandu-avatar
```

Alur upload avatar:

1. Flutter mengirim request multipart dengan field file `ava_pict`.
2. Middleware `multer.memoryStorage()` membaca file ke memory request.
3. Backend membuat path kompatibel seperti:
   ```txt
   /uploads/profile/filename.jpg
   /uploads/anak/filename.jpg
   ```
4. File diupload ke Cloud Storage dengan object name:
   ```txt
   profile/filename.jpg
   anak/filename.jpg
   ```
5. Database tetap menyimpan path `/uploads/...`.
6. API mengembalikan `ava_pict_url` berupa URL backend:
   ```txt
   https://backend-url/uploads/profile/filename.jpg
   ```
7. Saat URL itu dibuka, backend mengambil file dari Cloud Storage dan mengirimkannya ke client.

Dengan desain ini, bucket avatar tidak perlu dibuat public. File tetap bisa diakses lewat backend.

## Firebase dan Firestore

Firebase dipakai untuk bagian NoSQL dan integrasi mobile. Backend menggunakan `firebase-admin` melalui `backend/config/firebase.js`.

Urutan credential Firebase yang didukung:

1. `FIREBASE_SERVICE_ACCOUNT_JSON`
2. `backend/serviceAccountKey.json`
3. Application Default Credentials

Dalam pengembangan lokal, file `backend/serviceAccountKey.json` bisa dipakai. File ini tidak boleh dicommit karena berisi private key.

Firestore dipakai untuk data yang lebih fleksibel, misalnya:

- catatan pemeriksaan tambahan
- growth chart
- dynamic examination
- data mobile yang tidak selalu cocok dengan skema tabel SQL tetap

Pembagian ini membuat Cloud SQL tetap menjadi sumber data relasional utama, sementara Firestore dipakai untuk kebutuhan NoSQL.

## IAM dan Service Account

Ada beberapa service account yang terlibat:

- **Cloud Build service account**  
  Dipakai saat build image, push image, dan deploy Cloud Run.

- **Cloud Run runtime service account**  
  Dipakai backend saat aplikasi sedang berjalan.

- **Cloud Run Service Agent**  
  Service agent internal Google. Ini bukan akun yang dipakai langsung oleh kode backend.

- **Firebase service account**  
  Dipakai Firebase Admin SDK.

Runtime service account Cloud Run perlu role:

```txt
Cloud SQL Client
Storage Object Admin
```

`Cloud SQL Client` diperlukan agar Cloud Run bisa memakai Cloud SQL Unix socket. `Storage Object Admin` diperlukan agar backend bisa upload, baca, dan hapus avatar di bucket.

Untuk konfigurasi saat ini, runtime service account yang digunakan:

```txt
255520032221-compute@developer.gserviceaccount.com
```

## Environment

File `.env.example` adalah template konfigurasi. File `backend/.env` dipakai untuk pengembangan lokal.

Cloud Run tidak otomatis membaca file `.env`. Nilai environment production dikirim oleh `cloudbuild.yaml` melalui `--set-env-vars`.

Environment penting:

```env
JWT_SECRET=
DB_USER=
DB_PASSWORD=
DB_NAME=telemedicine_posyandu
DB_SOCKET_PATH=/cloudsql/praktikum-tcc01:us-central1:mysql-posyandu
DB_SSL=false
GCS_BUCKET_NAME=telemedicine-posyandu-avatar
FIREBASE_SERVICE_ACCOUNT_JSON=
NOTIFICATION_WORKER_SECRET=
```

Untuk local development, `DB_SOCKET_PATH` biasanya dikosongkan dan koneksi database bisa memakai `DB_HOST`.

## Endpoint Utama

Autentikasi dan profil:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/auth/me`
- `PATCH /api/auth/me/password`
- `POST /api/auth/me/avatar`
- `PATCH /api/auth/me/avatar`

Data anak:

- `GET /api/anak`
- `POST /api/anak`
- `GET /api/anak/:id`
- `POST /api/anak/:id/avatar`
- `PATCH /api/anak/:id/avatar`

Dashboard:

- `GET /api/dashboard`

Imunisasi:

- `GET /api/imunisasi`
- `POST /api/imunisasi`
- `PATCH /api/imunisasi/:id/status`
- `GET /api/immunizations`
- `POST /api/immunizations`

Pemeriksaan:

- `GET /api/pemeriksaan`
- `POST /api/pemeriksaan`
- `GET /api/examinations`
- `POST /api/examinations`

Notifikasi:

- `GET /api/notifications`
- `POST /api/notifications/device-token`
- `DELETE /api/notifications/device-token`
- `PATCH /api/notifications/read-all`
- `PATCH /api/notifications/:id/read`
- `POST /api/notifications/process-events`

## Keamanan

Hal yang tidak boleh dicommit:

- `backend/.env`
- `backend/serviceAccountKey.json`
- file key service account lain

Untuk production, secret seperti password database, JWT secret, dan Firebase service account sebaiknya disimpan di Secret Manager. Bucket backup SQL jangan dibuat public. Bucket avatar juga bisa tetap private karena file disajikan lewat backend.
