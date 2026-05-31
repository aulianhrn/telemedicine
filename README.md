# Posyandu Kita Mobile

Aplikasi mobile Flutter untuk membantu ibu memantau data kesehatan anak, jadwal imunisasi, riwayat pemeriksaan, grafik pertumbuhan, serta status gizi dan z-score.

## Fitur Utama

- Autentikasi ibu: login dan registrasi.
- Beranda dengan ringkasan anak utama, jadwal imunisasi mendatang, grafik berat badan, dan grafik tinggi badan.
- Jadwal imunisasi dengan kalender dan daftar imunisasi.
- Riwayat pemeriksaan anak berisi timeline pengukuran, catatan bidan, status gizi, dan z-score.
- Profil anak dengan foto anak, data tinggi/berat terakhir, dan grafik pertumbuhan.
- Profil pengguna dengan upload avatar, menu data anak, riwayat pengukuran, dan logout.
- Theme global menggunakan Google Font `Plus Jakarta Sans` agar tampilan konsisten.

## Teknologi

- Flutter SDK `^3.11.5`
- Dart
- REST API dengan package `http`
- Upload gambar dengan `image_picker`
- Google Fonts dengan `google_fonts`

## Struktur Folder Penting

```text
lib/
  models/              # Model response API, termasuk growth summary
  pages/               # Halaman aplikasi
  services/            # API service, session manager, formatter
  theme/               # Warna dan ThemeData global
  widgets/             # Widget reusable
```

## Backend

Secara default aplikasi memakai backend:

```text
https://backend-255520032221.us-central1.run.app/api
```

Base URL dapat diganti saat menjalankan aplikasi dengan `--dart-define`:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000/api
```

Endpoint growth mobile yang digunakan:

```text
GET /api/pemeriksaan/anak/:childId/mobile-growth-summary
```

Aplikasi juga memiliki fallback ke endpoint riwayat pemeriksaan bila data grafik dari summary kosong:

```text
GET /api/pemeriksaan?anak_id=:childId
```

## Notifikasi

Aplikasi memakai dua jenis notifikasi:

- Riwayat notifikasi in-app dari backend melalui `GET /api/notifications`.
- Push notification FCM melalui device token yang dikirim ke `POST /api/notifications/device-token`.

Endpoint notifikasi yang digunakan:

```text
POST   /api/notifications/device-token
DELETE /api/notifications/device-token
GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
```

Untuk push notification Android, tambahkan file konfigurasi Firebase:

```text
android/app/google-services.json
```

Untuk iOS, tambahkan:

```text
ios/Runner/GoogleService-Info.plist
```

Jika konfigurasi Firebase belum ada, aplikasi tetap bisa berjalan dan halaman notifikasi in-app tetap bisa mengambil data dari backend, tetapi FCM device token tidak akan terdaftar.

## Cara Menjalankan

1. Pastikan Flutter sudah terpasang.

```bash
flutter doctor
```

2. Ambil dependency.

```bash
flutter pub get
```

3. Jalankan aplikasi.

```bash
flutter run
```

Untuk memakai backend lokal:

```bash
flutter run --dart-define=API_BASE_URL=http://localhost:3000/api
```

## Quality Check

Jalankan analyzer:

```bash
flutter analyze
```

Jalankan test:

```bash
flutter test
```

## Catatan Pengembangan

- Konfigurasi API ada di `lib/services/api_service.dart`.
- Theme global ada di `lib/theme/app_theme.dart` dan `lib/theme/app_colors.dart`.
- Parser grafik pertumbuhan ada di `lib/models/growth_summary.dart`.
- Widget grafik dan card status gizi ada di `lib/widgets/growth_summary_widgets.dart`.
- Session login disimpan sementara di memory melalui `SessionManager`; saat aplikasi ditutup penuh, user perlu login ulang.

## Status

Project ini dibuat untuk kebutuhan tugas akhir/praktikum TCC dengan integrasi backend Telemedicine/Posyandu dan data growth chart dari Firestore.
