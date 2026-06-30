# PWA Requirements - Mobile dan iPhone Installable App

Dokumen ini menjelaskan requirement Progressive Web App untuk project Kelola Keuangan Keluarga.

## 1. Tujuan

PWA dipakai agar aplikasi bisa:

- Diakses sebagai website biasa.
- Dipasang ke Home Screen Android.
- Dipasang ke Home Screen iPhone melalui Add to Home Screen.
- Dibuka seperti aplikasi mobile tanpa membuat native Android/iOS app di fase awal.

## 2. Scope MVP

PWA masuk scope P0.

Fitur PWA MVP:

- Web app manifest.
- App icon berbagai ukuran.
- Theme color.
- Standalone display mode.
- Service worker.
- Offline fallback.
- Static asset caching.
- Install prompt untuk browser yang mendukung.
- Panduan install manual untuk iPhone.
- Responsive mobile layout.
- Safe area support untuk iPhone.
- Update available prompt.
- Online-first data persistence ke database server.

Out of scope MVP:

- Native Android app.
- Native iOS app.
- Offline-first full transaction input.
- Background sync transaksi.
- Web push notification sebagai fitur utama.

## 3. Model Penyimpanan Data

PWA yang dipasang di Android atau iPhone tetap terhubung ke aplikasi Laravel yang sama dengan versi website.

Saat online:

- User mengubah data dari PWA, misalnya tambah transaksi, bayar hutang, ubah budget, atau tambah target tabungan.
- React/Inertia mengirim request ke Laravel.
- Laravel melakukan validasi, authorization, dan business logic.
- Data disimpan ke MySQL di server.
- Setelah berhasil, data yang sama akan terlihat dari website, PWA Android, dan PWA iPhone selama user login ke akun yang sama.

Saat offline:

- PWA tidak bisa langsung menyimpan perubahan ke database server karena tidak ada koneksi.
- Untuk MVP, transaksi perubahan data finansial harus memakai strategi online-first.
- Jika user offline saat submit, tampilkan pesan bahwa data belum tersimpan dan minta user mencoba lagi saat online.
- Draft lokal boleh dipakai untuk form yang belum dikirim, tetapi harus diberi label jelas `belum tersimpan`.
- Jangan menampilkan perubahan offline sebagai data final sebelum berhasil tersinkron ke server.

Rencana lanjutan:

- Offline draft transaction.
- Sync queue.
- Conflict resolution.
- Enkripsi data lokal.
- Status sinkronisasi per item: draft, menunggu sinkron, berhasil, gagal.

## 4. Platform Target

### Android

Target:

- Browser modern yang mendukung PWA install prompt.
- User dapat memasang aplikasi ke Home Screen.
- Aplikasi terbuka dalam standalone mode jika browser mendukung.

### iPhone

Target:

- User dapat memasang aplikasi melalui Share lalu Add to Home Screen.
- Aplikasi harus punya icon yang benar.
- Layout harus mendukung safe area.
- Panduan install harus tersedia karena iPhone tidak selalu menampilkan install prompt seperti Android.

Catatan:

- Kemampuan PWA berbeda antar browser dan versi OS.
- Notifikasi push web di iPhone punya syarat dan batasan khusus, sehingga masuk P1.

## 5. Manifest Requirement

Manifest minimal berisi:

- `name`.
- `short_name`.
- `description`.
- `start_url`.
- `scope`.
- `display`.
- `background_color`.
- `theme_color`.
- `icons`.
- `screenshots` jika dibutuhkan untuk install UI.

Rekomendasi:

- `display`: `standalone`.
- `start_url`: `/dashboard`.
- `scope`: `/`.
- Icon minimal: 192x192, 512x512, maskable icon.

## 6. Service Worker Requirement

Service worker harus:

- Meng-cache app shell dan asset statis.
- Menyediakan offline fallback.
- Tidak meng-cache response private finansial secara default.
- Punya strategi update yang jelas.
- Bisa dibersihkan saat logout jika ada cache yang berhubungan dengan user.

Strategi awal:

- Static asset: cache-first.
- Offline fallback: cache-first.
- Authenticated page/API: network-only.
- Public page: network-first atau stale-while-revalidate jika aman.

## 7. Security dan Privacy

Aturan wajib:

- Jangan menyimpan OpenAI API key di browser.
- Jangan menyimpan data transaksi private di cache tanpa desain offline khusus.
- Jangan menyimpan data finansial sensitif di localStorage jika tidak diperlukan.
- Bersihkan storage saat logout.
- Jika nanti ada offline transaction mode, harus memakai enkripsi, conflict resolution, dan sync queue.
- Semua data final harus berasal dari database server, bukan hanya cache browser.

## 8. UI/UX Requirement

- Dashboard mobile harus mudah dibaca.
- Sidebar desktop berubah menjadi drawer.
- Tombol utama harus mudah dijangkau.
- Form transaksi harus nyaman dipakai dengan keyboard mobile.
- Offline state harus jelas.
- Jika perubahan belum tersimpan karena offline, statusnya harus jelas.
- Install guide iPhone harus memakai instruksi ringkas.
- Jangan meminta permission notifikasi terlalu awal.

## 9. Testing Checklist

- Manifest valid.
- Icon tampil benar.
- Install prompt muncul di browser yang mendukung.
- Add to Home Screen iPhone berhasil.
- Standalone mode berjalan.
- Offline fallback muncul saat internet mati.
- Logout membersihkan storage/cache yang sensitif.
- Dashboard mobile tidak overflow.
- Form transaksi mobile bisa digunakan nyaman.
- Perubahan data saat online tersimpan ke database dan terlihat di website.
- Submit saat offline tidak dianggap berhasil.
- Tidak ada API key atau secret di bundle frontend.

## 10. Roadmap Lanjutan

P1:

- Web push notification.
- Reminder budget dan cicilan via push.
- Better update notification.
- App shortcut.

P2:

- Offline transaction draft.
- Background sync.
- Native wrapper jika PWA sudah tervalidasi tetapi butuh app store distribution.

## 11. Referensi

- MDN Progressive Web Apps: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- Apple Safari Web Content Guide - Configuring Web Applications: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
- Apple WWDC - What's new in web apps: https://developer.apple.com/videos/play/wwdc2023/10120/
