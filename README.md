# Kelola Keuangan Keluarga

Aplikasi web untuk mengelola keuangan pribadi dan keluarga: rekening, pemasukan, pengeluaran, budget, tabungan, hutang, laporan, dan rekomendasi finansial berbasis AI.

Project ini dibangun dengan Laravel 13, React 19, Inertia, MySQL, Tailwind CSS, PWA, dan Laravel AI SDK untuk membantu pengguna memahami kondisi keuangan secara lebih jelas, cepat, dan terstruktur.

## Ringkasan

Kelola Keuangan Keluarga dirancang untuk pengguna perorangan, pasangan, dan keluarga yang ingin mencatat transaksi harian sekaligus melihat gambaran keuangan bulanan. Aplikasi ini tidak hanya menyimpan data transaksi, tetapi juga menghitung saldo per rekening, menganalisis pengeluaran terbesar, memantau hutang/cicilan, mengukur progress budget dan tabungan, serta menyiapkan insight AI dari data finansial yang sudah dihitung backend.

AI digunakan sebagai financial assistant untuk membuat rekomendasi penghematan, prioritas tabungan, analisis kebutuhan, dan arahan investasi umum berdasarkan cash flow aktual pengguna.

## Fitur Utama

- Dashboard keuangan modern dengan summary saldo, pemasukan, pengeluaran, cash flow, hutang, budget, dan tabungan.
- Quick Menu untuk akses cepat ke Transaksi, Akun, Kategori, Budget, Tabungan, Hutang, Laporan, AI Insight, dan Keluarga.
- Manajemen rekening per bank/e-wallet, misalnya `BRI - Moch Azmi Iskandar`, `Mandiri - Moch Azmi Iskandar`, dan rekening lainnya.
- Saldo rekening otomatis berubah berdasarkan pemasukan, pengeluaran, transfer, dan pembayaran hutang.
- Pencatatan pemasukan dan pengeluaran dengan kategori, merchant, deskripsi, tanggal, dan tipe kebutuhan.
- Transfer antar rekening tanpa dihitung sebagai pemasukan atau pengeluaran.
- Budget bulanan untuk membantu mengontrol pengeluaran.
- Target tabungan untuk merencanakan dana yang ingin dikumpulkan.
- Hutang dan cicilan, termasuk perhitungan sisa hutang dan cicilan yang harus dibayar.
- Laporan finansial untuk melihat kondisi pemasukan, pengeluaran, cash flow, dan pengeluaran terbesar.
- AI Insight untuk rekomendasi hemat, prioritas tabungan, dan arahan finansial dari data yang sudah dihitung backend.
- Dark mode, light mode, dan system mode.
- Login page custom sebagai halaman awal aplikasi.
- Progressive Web App agar aplikasi dapat dipasang ke Home Screen Android dan iPhone.
- Select searchable untuk pengalaman input yang lebih cepat.

## Tech Stack

Backend:

- Laravel 13
- PHP 8.4 direkomendasikan
- MySQL
- Redis untuk queue/cache
- Laravel AI SDK
- Laravel Pint
- PHPUnit

Frontend:

- React 19
- TypeScript
- Inertia
- Tailwind CSS 4
- Vite
- shadcn/ui style components
- lucide-react icons

AI:

- OpenAI API melalui Laravel AI SDK
- API key hanya disimpan di server melalui `.env`
- AI tidak menghitung angka utama secara langsung; backend menghitung metrik finansial terlebih dahulu

Mobile Delivery:

- PWA installable
- Online-first untuk data finansial
- Offline fallback aman

## Modul Aplikasi

- Auth: login, register, forgot password, profile, dan settings.
- Dashboard: ringkasan keuangan dan Quick Menu.
- Akun: rekening, bank/e-wallet, pemilik rekening, nomor rekening, saldo.
- Transaksi: pemasukan, pengeluaran, transfer, kategori, merchant, kebutuhan.
- Kategori: kategori pemasukan dan pengeluaran.
- Budget: kontrol batas pengeluaran.
- Tabungan: target dan progress tabungan.
- Hutang: hutang, cicilan, pembayaran, dan sisa hutang.
- Laporan: analisis pemasukan, pengeluaran, cash flow, dan export.
- AI Insight: rekomendasi hemat dan analisis finansial.
- Keluarga: fondasi pengelolaan anggota dan akses data keluarga.

## Arsitektur Singkat

Project memakai pendekatan Laravel sebagai backend utama dan React sebagai frontend Inertia.

- Controller dibuat tipis.
- Validasi input menggunakan Form Request.
- Logic finansial ditempatkan di Service.
- Perubahan saldo memakai database transaction.
- Data penting memakai enum agar tidak bergantung pada magic string.
- React fokus untuk UI dan interaksi, bukan kalkulasi finansial kompleks.
- PWA memakai service worker dan manifest.
- AI menerima snapshot/metrik dari backend, bukan data mentah tanpa kontrol.

## Persyaratan Lokal

Pastikan environment lokal memiliki:

- PHP 8.4
- Composer
- Node.js dan npm
- MySQL
- Redis jika ingin menjalankan queue/cache sesuai konfigurasi produksi

Untuk pengguna WAMP, pastikan PHP CLI yang dipakai terminal sama dengan PHP WAMP yang aktif. Cek dengan:

```bash
php -v
```

## Instalasi

Clone repository:

```bash
git clone https://github.com/<username>/kelola-keuangan-keluarga.git
cd kelola-keuangan-keluarga
```

Install dependency backend:

```bash
composer install
```

Install dependency frontend:

```bash
npm install
```

Buat file environment:

```bash
cp .env.example .env
php artisan key:generate
```

Atur database MySQL di `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=kelola_keuangan_keluarga
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan migration dan seeder:

```bash
php artisan migrate --seed
```

Jalankan aplikasi:

```bash
php artisan serve
npm run dev
```

Buka aplikasi:

```text
http://127.0.0.1:8000
```

Route `/` akan menampilkan halaman login custom. Jika user sudah login, aplikasi otomatis masuk ke dashboard.

## Konfigurasi OpenAI

Fitur AI menggunakan Laravel AI SDK dan OpenAI API. Simpan API key hanya di `.env` server:

```env
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxx
AI_FINANCE_ANALYSIS_MODEL=gpt-4.1-mini
```

Catatan keamanan:

- Jangan pernah menaruh `OPENAI_API_KEY` di React, JavaScript frontend, response API, log, atau repository Git.
- Backend menghitung metrik finansial terlebih dahulu.
- AI hanya membuat narasi, insight, rekomendasi, dan action plan dari data yang sudah disiapkan.

Jika `OPENAI_API_KEY` belum tersedia, aplikasi tetap dapat berjalan dengan fallback analisis deterministic.

## PWA

Aplikasi mendukung Progressive Web App:

- Installable di Android dan iPhone.
- Memiliki manifest dan service worker.
- Memiliki offline fallback.
- Data finansial memakai pendekatan online-first agar perubahan tetap tersimpan ke database server.

Untuk iPhone, install melalui browser Safari:

1. Buka aplikasi.
2. Tap tombol Share.
3. Pilih Add to Home Screen.

## Quality Gate

Jalankan format dan test sebelum membuat commit:

```bash
vendor/bin/pint --dirty
npm run build
php artisan test
```

Command tambahan:

```bash
npm run format
npm run lint
```

## Struktur Dokumentasi

Dokumen kebutuhan dan aturan implementasi tersedia di:

- `PRD.md`
- `AGENTS.md`
- `docs/TECHNICAL_ARCHITECTURE.md`
- `docs/UI_UX_GUIDELINES.md`
- `docs/MVP_BACKLOG.md`
- `docs/PWA_REQUIREMENTS.md`

## Status Project

Project masih dalam tahap pengembangan MVP. Fokus saat ini adalah membangun fondasi fitur finansial yang rapi, reusable, aman, dan mudah dikembangkan sebelum masuk ke integrasi lanjutan seperti bank connector, OCR struk, atau aplikasi mobile native.

## Lisensi

Project ini mengikuti lisensi yang ditentukan oleh owner repository.
