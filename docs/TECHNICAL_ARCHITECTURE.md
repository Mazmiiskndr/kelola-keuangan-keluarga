# Technical Architecture - Laravel 13 + React 19

Dokumen ini menjelaskan rekomendasi arsitektur teknis sebelum project mulai dicoding.

## 1. Tujuan Arsitektur

- Kode reusable dan mudah dimaintain.
- Business logic finansial tidak tersebar.
- Permission keluarga aman sejak awal.
- AI bisa dikembangkan tanpa mengganggu core finance.
- Frontend terasa modern seperti SPA, tetapi tetap memanfaatkan routing dan controller Laravel.

## 2. Stack Final

- Laravel 13 sebagai backend utama.
- React 19 + TypeScript untuk UI.
- Inertia 3 untuk navigasi tanpa full page reload.
- PWA untuk installable mobile experience.
- Tailwind CSS 4 untuk styling.
- shadcn/ui sebagai basis komponen.
- MySQL untuk database.
- Redis untuk queue, cache, rate limit, dan session jika diperlukan.
- Laravel AI SDK untuk OpenAI/ChatGPT API.

## 3. Struktur Folder Rekomendasi

```text
app/
  Actions/
  Ai/
    Agents/
  Data/
  Enums/
  Http/
    Controllers/
    Requests/
    Resources/
  Jobs/
  Models/
  Notifications/
  Policies/
  Services/
    Ai/
    Finance/
    Reports/
    Families/

resources/
  js/
    components/
      base/
      dashboard/
      finance/
      forms/
      layout/
    hooks/
    layouts/
    pages/
    types/
    utils/

public/
  icons/
  offline.html

resources/
  pwa/
    manifest.webmanifest
    service-worker.ts
```

## 4. Backend Layering

### Controller

Tugas controller:

- Menerima request.
- Memanggil Form Request untuk validasi.
- Memeriksa Policy jika diperlukan.
- Memanggil Service atau Action.
- Mengembalikan Inertia response atau JSON response.

Controller tidak boleh berisi kalkulasi finansial kompleks.

### Form Request

Tugas Form Request:

- Validasi input.
- Normalisasi input sederhana.
- Authorization request jika cocok.

Contoh:

- `StoreTransactionRequest`.
- `UpdateTransactionRequest`.
- `StoreDebtRequest`.
- `StoreDebtPaymentRequest`.
- `RunMonthlyAiAnalysisRequest`.

### Service

Tugas service:

- Menjalankan business logic.
- Mengatur database transaction.
- Menghitung saldo, budget, hutang, dan metrik finansial.
- Menjadi reusable logic untuk controller, job, command, dan test.

Service utama:

- `TransactionService`.
- `AccountBalanceService`.
- `TransferService`.
- `BudgetService`.
- `SavingGoalService`.
- `DebtService`.
- `DebtPaymentService`.
- `FinancialMetricService`.
- `ReportService`.
- `FamilyPermissionService`.
- `AiAnalysisService`.
- `AiUsageService`.

### Action

Gunakan Action untuk proses spesifik yang punya input-output jelas.

Contoh:

- `CreateExpenseTransaction`.
- `RecordDebtPayment`.
- `GenerateMonthlyFinanceSnapshot`.
- `BuildAiFinanceContext`.
- `GenerateSavingRecommendation`.

### Enum

Gunakan Enum untuk nilai tetap.

Contoh:

- `TransactionType`.
- `AccountType`.
- `Visibility`.
- `FamilyRole`.
- `NeedType`.
- `DebtType`.
- `DebtStatus`.
- `RecommendationStatus`.
- `AiAnalysisType`.

## 5. Frontend Architecture

### Layout

Gunakan layout utama:

- `AuthenticatedLayout`.
- `GuestLayout`.
- `AdminLayout`.

`AuthenticatedLayout` berisi:

- Sidebar.
- Topbar.
- Main content.
- Responsive mobile drawer.
- User menu.
- PWA install prompt atau install guide.

### Pages

Halaman Inertia disimpan di `resources/js/pages`.

Contoh:

- `Dashboard/Index.tsx`.
- `Transactions/Index.tsx`.
- `Transactions/Create.tsx`.
- `Accounts/Index.tsx`.
- `Budgets/Index.tsx`.
- `SavingGoals/Index.tsx`.
- `Debts/Index.tsx`.
- `Debts/Show.tsx`.
- `Reports/Index.tsx`.
- `AiInsights/Index.tsx`.
- `Families/Dashboard.tsx`.

### Component Reuse

Komponen yang harus reusable:

- `StatCard`.
- `MetricTrendCard`.
- `MoneyDisplay`.
- `PeriodFilter`.
- `CategoryBadge`.
- `AccountSelector`.
- `TransactionTable`.
- `DebtSummaryCard`.
- `BudgetProgress`.
- `SavingGoalProgress`.
- `AiRecommendationCard`.
- `DashboardChartCard`.

## 6. Data Flow

### Inertia Page Load

1. User membuka halaman.
2. Route Laravel memanggil controller.
3. Controller mengambil data melalui service/query.
4. Controller mengembalikan Inertia props.
5. React merender halaman.
6. Navigasi antar halaman memakai Inertia, sehingga tidak full page reload.

### Create/Update/Delete

1. React mengirim data memakai Inertia form.
2. Laravel Form Request memvalidasi input.
3. Policy mengecek akses.
4. Service menjalankan logic dan database transaction.
5. Redirect kembali dengan flash message.
6. Inertia refresh data yang diperlukan.

## 7. PWA Architecture

PWA dibuat agar aplikasi bisa dipasang ke Home Screen Android dan iPhone tanpa native app di fase MVP.

Komponen PWA:

- Web app manifest.
- App icon berbagai ukuran.
- Theme color.
- Service worker.
- Offline fallback page.
- Cache static asset.
- Install guide untuk iPhone.
- Standalone display mode.

Strategi cache:

- Cache asset statis seperti JS, CSS, font, dan icon.
- Cache offline fallback.
- Jangan cache response authenticated yang berisi data finansial private secara default.
- Jika nanti ada offline data mode, buat desain khusus dengan enkripsi, sync queue, dan user opt-in.

PWA mobile behavior:

- Sidebar desktop berubah menjadi drawer di mobile.
- Gunakan safe area padding untuk iPhone.
- Form utama harus nyaman dipakai dengan keyboard mobile.
- Chart dan table punya mode mobile-friendly.

Web push:

- Masuk fase P1.
- Gunakan VAPID key dan channel notification yang sesuai saat implementasi.
- Tetap sediakan in-app notification sebagai fallback.

## 8. Finance Domain Rules

Core finance harus diperlakukan sebagai domain paling penting.

- Saldo akun harus konsisten dengan transaksi.
- Operasi transaksi harus atomic.
- Transfer tidak masuk income/expense.
- Hutang jatuh tempo dihitung sebagai kewajiban bulanan.
- Pembayaran hutang masuk pengeluaran wajib.
- Budget hanya menghitung expense sesuai periode.
- Family report hanya memakai data dengan permission benar.

## 9. AI Architecture

Gunakan 2 layer:

- `FinancialMetricService`: menghitung angka deterministik.
- Laravel AI Agent: membuat analisis, narasi, dan rekomendasi.

Alur AI:

1. User meminta analisis.
2. Service membuat snapshot finansial.
3. Snapshot disimpan.
4. Job memanggil agent AI.
5. Agent menghasilkan structured output.
6. Output divalidasi dan disimpan.
7. UI menampilkan hasil.

AI tidak boleh langsung membaca semua transaksi mentah tanpa penyaringan permission.

## 10. Security Architecture

- Semua model utama harus punya Policy.
- Semua endpoint mutasi wajib authorization.
- Data private anggota keluarga tidak boleh masuk laporan keluarga.
- OpenAI API key hanya di server.
- Endpoint AI wajib rate limit.
- Export laporan wajib audit log.
- File attachment wajib validasi mime type dan size.
- Service worker tidak boleh menyimpan data sensitif tanpa strategi keamanan yang jelas.
- Logout harus membersihkan cache/storage PWA yang berpotensi berisi data user.

## 11. Testing Strategy

Prioritas test:

- Unit test untuk kalkulasi finansial.
- Feature test untuk transaksi, hutang, budget, dan family permission.
- Test untuk mencegah akses data lintas user.
- Test untuk AI service memakai fake provider, bukan call OpenAI asli.
- Test untuk report summary agar total income/expense/debt benar.
- Test manual PWA installability di Android dan iPhone.
- Test offline fallback.

## 12. Routing dan Authentication Entry Point

- Route `/` menjadi entry point login untuk guest.
- Route `/` harus redirect ke `dashboard` jika request sudah memiliki user authenticated.
- Halaman login dirender melalui Inertia page `auth/login`.
- Flow autentikasi tetap memakai route dan controller Laravel starter kit agar session, CSRF, remember me, forgot password, dan rate limit auth tetap konsisten.
- Welcome page bawaan Laravel tidak digunakan sebagai halaman pertama aplikasi.

## 13. Theme Architecture

- React memakai hook `useAppearance` sebagai sumber utama preferensi tema.
- Nilai tema yang didukung adalah `light`, `dark`, dan `system`.
- Preferensi disimpan di local storage dengan key yang konsisten.
- Aplikasi menambahkan atau menghapus class `dark` pada root document agar Tailwind dark variant bekerja global.
- Toggle tema boleh berbentuk segmented control di area luas dan dropdown icon di header aplikasi.
- Komponen baru wajib memakai token warna yang kompatibel dengan light dan dark mode.
- Jangan menyimpan preferensi tema di server untuk MVP kecuali nanti dibutuhkan sinkronisasi lintas device.
