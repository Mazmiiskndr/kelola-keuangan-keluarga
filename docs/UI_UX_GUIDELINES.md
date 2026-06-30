# UI/UX Guidelines - Dashboard Keuangan Modern

Dokumen ini menjadi acuan tampilan aplikasi. Vuexy Admin boleh dijadikan referensi pola visual dan UX, tetapi desain, kode, asset, dan warna harus dibuat sendiri.

## 1. Arah Visual

Target tampilan:

- Modern.
- Profesional.
- Rapi.
- Cepat dipindai.
- Cocok untuk aplikasi keuangan pribadi dan keluarga.
- Tidak terlalu ramai.
- Nyaman dipakai harian.
- Terasa natural saat dibuka sebagai PWA di mobile/iPhone.

Inspirasi dari Vuexy:

- Sidebar navigation.
- Topbar dengan search, notification, dan user menu.
- Dashboard card yang ringkas.
- Chart dan statistik yang mudah dibaca.
- Dark mode.
- Layout admin yang responsif.

Catatan: Vuexy adalah template komersial. Gunakan sebagai referensi UX, bukan untuk disalin langsung.

## 2. Layout Utama

### Desktop

- Sidebar kiri fixed atau collapsible.
- Topbar di kanan atas area content.
- Content area memakai max width yang nyaman.
- Dashboard memakai grid 12 kolom.
- Data penting muncul di first viewport.

### Mobile

- Sidebar berubah menjadi drawer.
- Topbar tetap ringkas.
- Card ditumpuk satu kolom.
- Chart tetap terbaca.
- Tabel harus punya mode responsive atau compact list.
- Gunakan safe area padding untuk perangkat iPhone.
- Hindari kontrol penting yang terlalu dekat dengan tepi bawah layar.
- Pastikan form transaksi nyaman dipakai dengan keyboard mobile.

## 3. Sidebar Navigation

Menu utama:

- Dashboard.
- Transaksi.
- Akun.
- Budget.
- Tabungan.
- Hutang.
- Laporan.
- AI Insight.
- Keluarga.
- Pengaturan.

Prinsip:

- Gunakan icon + label.
- Active state jelas.
- Group menu jika item mulai banyak.
- Jangan membuat sidebar terlalu panjang di MVP.
- Untuk role admin keluarga, tampilkan menu keluarga sesuai permission.

## 4. Dashboard Individu

Komponen prioritas:

- Total saldo.
- Pemasukan bulan ini.
- Pengeluaran bulan ini.
- Cash flow bersih.
- Cicilan bulan ini.
- Progress budget.
- Progress target tabungan.
- Pengeluaran terbesar.
- AI insight ringkas.
- Chart pemasukan vs pengeluaran.
- Chart pengeluaran per kategori.

First viewport harus menjawab:

- Uang saya sekarang berapa?
- Bulan ini pemasukan dan pengeluaran berapa?
- Cicilan yang harus dibayar berapa?
- Pengeluaran terbesar di mana?
- Apa rekomendasi AI paling penting?

Quick Menu:

- Tampilkan akses cepat ke fitur utama setelah summary cards.
- Item Quick Menu harus memakai icon, nama fitur, dan deskripsi singkat.
- Setiap item harus clickable dan masuk ke halaman fitur terkait.
- Grid Quick Menu harus responsif, mudah ditekan di mobile, dan tetap terbaca di dark/light mode.

## 5. Dashboard Keluarga

Komponen prioritas:

- Total saldo keluarga.
- Total pemasukan keluarga.
- Total pengeluaran keluarga.
- Cash flow keluarga.
- Total cicilan keluarga bulan ini.
- Pengeluaran per anggota.
- Pengeluaran terbesar keluarga.
- Budget keluarga.
- Target tabungan keluarga.
- AI rekomendasi keluarga.

## 6. Design Tokens Awal

Rekomendasi warna:

- Background light: putih atau slate sangat muda.
- Background dark: neutral/slate gelap.
- Primary: blue atau indigo yang tidak terlalu dominan.
- Success: green.
- Warning: amber.
- Danger: red.
- Info: cyan atau sky.

Gunakan warna untuk makna finansial:

- Income: green.
- Expense: red atau rose.
- Saving: blue.
- Debt: amber/orange.
- Investment: violet atau teal.

Hindari UI yang hanya memakai satu keluarga warna. Dashboard perlu warna fungsional agar data mudah dibaca.

## 7. Component Standard

Komponen dasar:

- Button.
- Input.
- Select.
- Date picker.
- Dialog/modal.
- Sheet/drawer.
- Tabs.
- Badge.
- Card.
- Table.
- Dropdown menu.
- Toast.
- Tooltip.
- Progress bar.
- Skeleton loading.

Komponen domain:

- Money display.
- Percentage change.
- Category badge.
- Account badge.
- Budget progress.
- Saving goal progress.
- Debt status badge.
- Recommendation card.
- Financial health score.

## 8. Chart Guidelines

Chart yang dibutuhkan:

- Line chart untuk trend pemasukan/pengeluaran.
- Bar chart untuk perbandingan kategori.
- Donut chart untuk komposisi pengeluaran.
- Progress chart untuk budget dan tabungan.
- Small sparkline untuk trend card.

Aturan:

- Jangan memakai chart 3D.
- Jangan terlalu banyak warna dalam satu chart.
- Label nominal harus jelas.
- Tooltip harus menampilkan nominal dan persentase.
- Data kosong harus punya empty state.

## 9. Empty State

Setiap halaman harus punya empty state.

Contoh:

- Belum ada transaksi.
- Belum ada akun.
- Belum ada budget.
- Belum ada hutang.
- AI belum bisa menganalisis karena data belum cukup.

Empty state harus memberi action jelas, misalnya tombol tambah transaksi atau buat budget.

## 10. Loading State

Karena memakai Inertia, perpindahan halaman tidak full page reload. Tetap perlu:

- Progress indicator tipis saat navigation.
- Skeleton untuk card dan table.
- Disabled submit button saat form sedang diproses.
- Optimistic UI hanya untuk aksi yang aman.

## 11. PWA UX

PWA harus terasa seperti aplikasi mobile saat dibuka dari Home Screen.

Kebutuhan UX:

- Install prompt untuk browser yang mendukung.
- Panduan install manual untuk iPhone.
- Offline fallback yang informatif.
- Update available prompt saat service worker menemukan versi baru.
- Standalone mode tidak bergantung pada browser chrome.
- Icon aplikasi jelas dan tetap terbaca di Home Screen.
- Splash/background color sesuai brand.
- Mobile navigation mudah dijangkau.

Catatan:

- Jangan menampilkan prompt install terlalu sering.
- Jangan meminta notification permission sebelum user memahami manfaatnya.
- Jika offline, jangan tampilkan data finansial lama sebagai data terbaru tanpa label yang jelas.

## 12. Accessibility

- Kontras warna harus cukup.
- Semua button icon harus punya label atau tooltip.
- Form error harus jelas.
- Navigasi keyboard harus tetap bisa digunakan.
- Jangan hanya mengandalkan warna untuk status.

## 13. Larangan Desain

- Jangan membuat dashboard seperti landing page marketing.
- Jangan memakai dekorasi berlebihan.
- Jangan membuat card di dalam card tanpa kebutuhan jelas.
- Jangan menyalin template Vuexy secara langsung.
- Jangan menampilkan terlalu banyak metrik tanpa prioritas.
- Jangan membuat text terlalu kecil untuk data finansial penting.

## 14. Referensi

- Vuexy Admin Template by Pixinvent: https://pixinvent.com/vuexy-bootstrap-html-admin-template/
- Pixinvent product catalog: https://pixinvent.com/
- MDN Progressive Web Apps: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

## 15. Dark Mode dan Light Mode

- Aplikasi wajib mendukung Light, Dark, dan System mode.
- Toggle tema harus tersedia di halaman login dan area aplikasi setelah login.
- Gunakan token warna Tailwind dan CSS variable yang sudah ada agar komponen konsisten.
- Jangan membuat warna hardcoded yang hanya terbaca di salah satu mode.
- Form, select, date picker, table, chart, sidebar, topbar, card, badge, pagination, modal, dan empty state wajib dicek di light dan dark mode.
- Preferensi tema harus tersimpan dan langsung diterapkan ketika user kembali membuka aplikasi.
- Hindari flash warna yang mengganggu saat aplikasi pertama kali dimuat.

## 16. Login Page

- Route `/` untuk guest wajib menampilkan halaman login custom.
- Login page harus menjadi bagian dari pengalaman produk, bukan halaman default Laravel.
- Desktop boleh memakai layout split visual dan form, sedangkan mobile harus fokus pada form login yang ringkas.
- Login page harus menampilkan identitas aplikasi, manfaat utama, dan akses theme toggle.
- Jangan menaruh penjelasan terlalu panjang di login page.
- Form login harus jelas, mudah dipakai, dan tetap mendukung remember me, lupa password, serta registrasi jika fitur register aktif.
