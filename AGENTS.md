# AGENTS.md - Aturan Kerja Project Kelola Keuangan Keluarga

Dokumen ini wajib dibaca sebelum membuat atau mengubah kode di project ini. Tujuannya agar semua implementasi konsisten, reusable, mudah dites, dan mudah dimaintain.

## 1. Bahasa dan Komunikasi

- Gunakan bahasa Indonesia untuk penjelasan ke owner project.
- Jelaskan perubahan secara singkat, jelas, dan teknis.
- Jika ada beberapa solusi, pilih yang paling aman, paling kecil dampaknya, dan paling sesuai dengan struktur project.
- Jangan mengubah area di luar scope request kecuali benar-benar diperlukan.

## 2. Wajib Pahami Konteks Sebelum Coding

Sebelum membuat atau mengubah kode:

- Baca `PRD.md`.
- Baca dokumen di folder `docs/` yang relevan.
- Pahami struktur folder, naming convention, dependency, helper, service, request, resource, policy, enum, dan reusable component yang sudah ada.
- Cari dulu apakah logic yang dibutuhkan sudah tersedia.
- Gunakan atau adaptasi logic yang sudah ada sebelum membuat logic baru.

## 3. Tech Stack Utama

- Backend: Laravel 13.
- Frontend: React 19 + TypeScript.
- Bridge: Inertia 3.
- Mobile delivery: Progressive Web App.
- Styling: Tailwind CSS 4.
- UI components: shadcn/ui atau component internal berbasis Tailwind.
- Database: MySQL.
- Queue/cache: Redis.
- AI: Laravel AI SDK (`laravel/ai`) dengan OpenAI API.
- Testing: Pest atau PHPUnit.
- Formatter: Laravel Pint.
- Static analysis: Larastan/PHPStan.

## 4. Prinsip Coding

Semua kode harus mengikuti prinsip:

- SRP: satu class/function punya satu tanggung jawab utama.
- DRY: hindari duplikasi logic.
- KISS: solusi sederhana lebih diutamakan daripada abstraksi berlebihan.
- SOLID jika relevan.
- Clean code: nama jelas, method pendek, dependency eksplisit, flow mudah dibaca.
- Reusable: logic bisnis tidak boleh terkunci di controller atau React component.
- Maintainable: struktur mudah dipahami developer lain.

## 5. Aturan Backend Laravel

- Controller harus tipis.
- Validasi input wajib memakai Form Request.
- Authorization wajib memakai Policy atau Gate.
- Logic bisnis utama ditempatkan di Service atau Action.
- Response API memakai Resource jika datanya kompleks.
- Gunakan Enum untuk nilai tetap seperti transaction type, visibility, role, account type, need type, debt status, dan recommendation status.
- Gunakan database transaction untuk operasi yang mengubah saldo, transaksi, hutang, pembayaran hutang, tabungan, dan transfer.
- Jangan melakukan kalkulasi finansial penting langsung di controller.
- Jangan memakai magic string atau magic number untuk rule finansial.
- Semua operasi lintas user/family harus dicek permission.

## 6. Aturan Frontend React

- Gunakan React component yang kecil dan reusable.
- Pisahkan page, layout, feature component, dan base UI component.
- Jangan menaruh business rule finansial kompleks di React.
- React hanya menampilkan data, mengelola interaksi UI, dan mengirim action ke Laravel.
- Gunakan TypeScript type/interface untuk props dan data penting.
- Gunakan Inertia Link/Form agar navigasi terasa SPA tanpa full page reload.
- Pastikan layout dan component utama PWA-ready untuk mobile, tablet, dan desktop.
- Jangan mengandalkan hover-only interaction untuk fitur penting karena user mobile tidak punya hover.
- Hindari prop drilling berlebihan. Jika state hanya untuk satu fitur, simpan lokal. Jika lintas fitur, buat hook/context yang jelas.
- Component chart, table, filter, modal, dan stat card harus reusable.

## 7. Aturan PWA

- Aplikasi harus bisa berjalan sebagai website dan installable PWA.
- Sediakan web app manifest, icon, theme color, dan service worker.
- Sediakan offline fallback yang aman.
- Jangan cache response berisi data finansial private secara sembarangan.
- Saat logout, bersihkan cache/storage yang berpotensi menyimpan data sensitif.
- Untuk iPhone, siapkan panduan install melalui Share lalu Add to Home Screen.
- Web push notification diperlakukan sebagai fitur lanjutan karena dukungan browser/perangkat berbeda-beda.
- PWA memakai pendekatan online-first untuk data finansial: perubahan saat online harus tersimpan ke database server.
- Jika user offline, jangan tandai perubahan finansial sebagai berhasil sebelum tersinkron ke server.
- Draft offline harus diberi status jelas dan tidak boleh dianggap sebagai data final.

## 8. Aturan AI dan OpenAI

- OpenAI API key hanya boleh disimpan di server Laravel melalui `.env`.
- Jangan pernah expose `OPENAI_API_KEY` ke React, browser, log, response API, atau repository Git.
- Konfigurasi provider/model AI diletakkan di `config/ai.php`.
- Gunakan Laravel AI SDK (`laravel/ai`) untuk integrasi AI.
- Semua angka finansial dihitung oleh backend sebelum dikirim ke AI.
- AI hanya membuat narasi, insight, rekomendasi, dan action plan dari data yang sudah dihitung.
- Output AI harus divalidasi schema sebelum disimpan.
- Fitur AI wajib punya rate limit.
- Analisis AI yang berat dijalankan lewat Queue.

## 9. Aturan Fitur Keuangan

- Pemasukan menambah saldo akun.
- Pengeluaran mengurangi saldo akun.
- Transfer tidak dihitung sebagai pemasukan atau pengeluaran.
- Hutang dan cicilan wajib masuk perhitungan pengeluaran wajib.
- Pembayaran hutang harus membuat transaksi pengeluaran dan mengurangi sisa hutang.
- Rekomendasi tabungan dan investasi wajib memperhitungkan cicilan minimum lebih dulu.
- Laporan keluarga hanya boleh memakai data sesuai permission visibility.

## 10. Aturan UI/UX

- Dashboard harus modern, rapi, cepat dipindai, dan cocok untuk aplikasi finansial.
- Gunakan sidebar sebagai navigasi utama.
- Sidebar harus responsive dan berubah menjadi drawer/bottom-friendly navigation di mobile.
- Route `/` untuk guest harus menampilkan halaman login custom aplikasi, bukan welcome page bawaan Laravel.
- Jika user sudah login, route `/` harus redirect ke dashboard.
- Aplikasi wajib mendukung light mode, dark mode, dan system mode.
- Toggle tema wajib tersedia di halaman login, header aplikasi, dan halaman pengaturan tampilan.
- Vuexy Admin boleh dijadikan inspirasi visual untuk pola sidebar, topbar, dashboard card, chart, dark mode, dan layout admin.
- Jangan menyalin source code, asset, warna, atau desain Vuexy secara langsung.
- UI harus tetap dibuat dengan komponen sendiri berbasis React, Tailwind, dan shadcn/ui.
- Setiap halaman utama harus responsif desktop dan mobile.
- Tabel, filter, chart, summary card, dan empty state harus konsisten.
- Jangan membuat UI terlalu ramai. Data finansial harus mudah dibaca.

## 11. Testing dan Quality Gate

Minimal test untuk fitur penting:

- TransactionService.
- AccountBalanceService.
- DebtService.
- DebtPaymentService.
- BudgetService.
- SavingGoalService.
- FinancialMetricService.
- AiAnalysisService.
- FamilyPermissionService.

Sebelum dianggap selesai:

- Jalankan test yang relevan.
- Jalankan formatter.
- Pastikan tidak ada akses data lintas user/family.
- Pastikan tidak ada API key atau secret yang masuk Git.
- Pastikan manifest, service worker, dan offline fallback PWA berjalan.
- Pastikan perubahan tidak merusak flow utama.

## 12. Larangan

- Jangan membuat ulang helper/service/component jika sudah ada yang relevan.
- Jangan membuat refactor besar tanpa kebutuhan jelas.
- Jangan menaruh business logic kompleks di controller atau React component.
- Jangan menaruh secret di frontend.
- Jangan menghapus data finansial permanen jika masih terkait laporan. Gunakan soft delete atau archive jika sesuai.
- Jangan membuat AI menghitung angka penting tanpa validasi backend.
