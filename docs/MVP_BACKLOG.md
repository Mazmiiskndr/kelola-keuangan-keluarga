# MVP Backlog - Kelola Keuangan Keluarga

Dokumen ini memecah PRD menjadi backlog awal agar development lebih terarah.

## 1. Foundation

Prioritas: P0

- Setup Laravel 13.
- Pilih React starter kit.
- Setup Inertia 3 + React 19 + TypeScript.
- Setup Tailwind CSS 4.
- Setup shadcn/ui.
- Setup PWA manifest.
- Setup service worker.
- Setup offline fallback.
- Siapkan app icons untuk Android dan iPhone.
- Setup MySQL.
- Setup Redis.
- Setup Laravel Pint.
- Setup Pest/PHPUnit.
- Setup Larastan/PHPStan.
- Setup base layout dengan sidebar.
- Setup mobile responsive layout untuk PWA.
- Setup auth.
- Setup role dan permission dasar.

Definition of Done:

- User bisa register, login, logout.
- Layout authenticated dengan sidebar tersedia.
- Aplikasi punya manifest dan offline fallback.
- CI atau command lokal untuk test dan format tersedia.

## 2. Core Finance

Prioritas: P0

- Financial account CRUD.
- Category CRUD.
- Income transaction.
- Expense transaction.
- Transfer antar akun.
- Saldo akun otomatis.
- Soft delete atau archive untuk data finansial penting.
- Audit log dasar.

Definition of Done:

- Pemasukan menambah saldo.
- Pengeluaran mengurangi saldo.
- Transfer tidak masuk income/expense.
- Semua mutasi saldo memakai database transaction.

## 3. Hutang dan Cicilan

Prioritas: P0

- Debt CRUD.
- Debt payment CRUD.
- Hitung total sisa hutang.
- Hitung total cicilan bulan ini.
- Hitung cicilan sudah dibayar dan belum dibayar.
- Generate transaksi pengeluaran saat pembayaran hutang.
- Reminder jatuh tempo dasar.
- Debt to income ratio.

Definition of Done:

- Pembayaran hutang mengurangi saldo akun.
- Pembayaran hutang mengurangi outstanding debt.
- Cicilan masuk pengeluaran wajib.
- AI dan laporan memakai total cicilan sebagai kewajiban bulanan.

## 4. Budget dan Tabungan

Prioritas: P0

- Budget bulanan per kategori.
- Budget total bulanan.
- Target tabungan.
- Progress budget.
- Progress tabungan.
- Alert budget mendekati limit.

Definition of Done:

- User bisa melihat kategori yang melewati budget.
- User bisa melihat nominal yang harus ditabung per bulan.

## 5. Dashboard Individu

Prioritas: P0

- Summary cards.
- Chart pemasukan vs pengeluaran.
- Chart pengeluaran per kategori.
- Pengeluaran terbesar.
- Hutang jatuh tempo.
- Progress budget.
- Progress tabungan.
- AI insight preview.
- Quick Menu ke Transaksi, Akun, Kategori, Budget, Tabungan, Hutang, Laporan, AI Insight, dan Keluarga.

Definition of Done:

- Dashboard menjawab kondisi keuangan bulan berjalan.
- Data bisa difilter berdasarkan periode.
- Tampilan responsive dan memakai sidebar.
- Dashboard nyaman dibuka sebagai PWA di mobile/iPhone.
- Quick Menu dapat diklik dan mengarah ke halaman fitur yang sesuai.

## 6. PWA MVP

Prioritas: P0

- Web app manifest.
- App icon berbagai ukuran.
- Theme color.
- Standalone display mode.
- Service worker.
- Offline fallback page.
- Cache static asset.
- Install prompt untuk Android/browser yang mendukung.
- Install guide untuk iPhone.
- Safe area support untuk iPhone.
- Update available prompt.
- Logout cleanup untuk cache/storage sensitif.
- Online-first save flow ke database Laravel/MySQL.
- Offline submit warning untuk form transaksi, hutang, budget, dan tabungan.

Definition of Done:

- Aplikasi dapat dipasang ke Home Screen Android.
- Aplikasi dapat dipasang ke Home Screen iPhone melalui Add to Home Screen.
- Aplikasi terbuka dalam standalone mode jika browser mendukung.
- Offline fallback muncul saat koneksi hilang.
- Data finansial private tidak di-cache sembarangan.
- Perubahan dari PWA saat online tersimpan ke database dan terlihat di website.
- Submit saat offline tidak ditandai berhasil sebelum data tersimpan ke server.

## 7. Family Management

Prioritas: P0

- Create family.
- Invite member.
- Accept invitation.
- Role family admin/member/viewer.
- Visibility transaksi private/family/shared.
- Dashboard keluarga dasar.

Definition of Done:

- Admin keluarga bisa melihat data keluarga sesuai permission.
- Data private anggota tidak muncul di laporan keluarga.

## 8. Reports

Prioritas: P0

- Laporan cash flow.
- Laporan kategori.
- Laporan pengeluaran terbesar.
- Laporan hutang.
- Export CSV.

Definition of Done:

- Laporan mengikuti filter periode.
- Export mengikuti permission.

## 9. AI MVP

Prioritas: P0

- Install dan konfigurasi Laravel AI SDK.
- Tambahkan `OPENAI_API_KEY` di `.env.example` tanpa nilai rahasia.
- Buat financial snapshot.
- Buat monthly analysis agent.
- Buat saving recommendation agent.
- Buat debt analysis agent.
- Simpan hasil AI analysis.
- Rate limit endpoint AI.
- Queue job untuk analisis berat.

Definition of Done:

- AI memberi rekomendasi berdasarkan data aktual.
- AI tidak menghitung angka utama sendiri.
- AI memperhitungkan cicilan sebelum tabungan/investasi.
- Output AI disimpan dalam format terstruktur.

## 10. UI Polish

Prioritas: P0 untuk theme dasar, P1 untuk polish lanjutan

- Dark mode, light mode, dan system mode.
- Toggle tema di halaman login, header aplikasi, dan pengaturan tampilan.
- Route `/` menampilkan login custom untuk guest dan redirect dashboard untuk user authenticated.
- Login page custom yang responsif dan tidak memakai welcome page bawaan Laravel.
- Collapsible sidebar.
- Global search.
- Notification dropdown.
- Better empty states.
- Better skeleton loading.
- Responsive table mode.

Definition of Done:

- Aplikasi terlihat modern dan konsisten.
- UX dashboard nyaman dipakai desktop dan mobile.
- Tema tetap tersimpan setelah browser dibuka ulang.
- Semua halaman utama terbaca baik di light mode dan dark mode.

## 11. Advanced Finance

Prioritas: P1

- Dana darurat detail.
- Investasi manual.
- Recurring transaction.
- Export PDF/Excel.
- Email notification.

## 12. AI Advanced

Prioritas: P1

- AI chat.
- AI klasifikasi transaksi.
- AI deteksi anomali.
- Predictive cash flow.
- Evaluasi action plan.
