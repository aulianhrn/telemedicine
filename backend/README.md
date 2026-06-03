# Telemedicine Posyandu Backend

Dokumentasi utama ada di README root project:

```txt
../README.md
```

Ringkasnya, backend ini memakai:

- Cloud SQL MySQL untuk data utama.
- Cloud Storage untuk file avatar.
- Firebase Admin / Firestore untuk kebutuhan NoSQL.
- Cloud Build untuk build dan deploy.
- Cloud Run untuk menjalankan API.

Setup lokal dari folder ini:

```bash
npm install
copy ..\.env.example .env
npm run dev
```
