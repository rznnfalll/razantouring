# Razan Touring - Galeri Foto Perjalanan

Aplikasi web modern untuk menyimpan dan mendokumentasikan foto-foto selama touring. Setiap satu sesi touring memiliki nama tujuan touring dan memuat **3 foto perjalanan**. Dilengkapi dengan autentikasi login, kompresi foto otomatis, penyimpanan database lokal browser (IndexedDB berkapasitas besar), serta tampilan galeri yang minimalis dan responsif.

---

## 🔑 Akun Login

- **Username**: `razan`
- **Password**: `11111111`

---

## ✨ Fitur Utama

1. **Format 1 Touring = 3 Foto**:
   - Masukkan nama tujuan turing (misal: *Touring ke Pantai Menganti Kebumen*, *Touring Puncak Pass*).
   - Masukkan tanggal dan catatan/motor yang digunakan.
   - Unggah tepat 3 foto pilihan dalam sekali turing.
   - Preview foto langsung muncul sebelum disimpan.

2. **Penyimpanan Database Lokal Berkapasitas Besar (IndexedDB)**:
   - Menggunakan IndexedDB di browser, bukan sekadar LocalStorage, sehingga foto-foto Anda tidak terbatas kuota 5MB dan tersimpan secara permanen di laptop Anda tanpa perlu biaya server backend.
   - Dilengkapi kompresi gambar otomatis via HTML5 Canvas agar foto tetap tajam tapi ringan dimuat.

3. **Tampilan Galeri Kolase & Lightbox HD**:
   - Setiap kartu turing menampilkan 3 foto dalam susunan kolase yang rapi.
   - Klik pada foto mana pun untuk membukanya dalam ukuran besar (Full-screen Lightbox).

4. **Pencarian & Pengurutan**:
   - Cari tujuan turing dengan mudah lewat search bar.
   - Urutkan berdasarkan yang terkini, terlama, atau abjad A-Z.

---

## 🚀 Cara Menjalankan Langsung di Komputer

1. Buka folder **`Razan-Touring-Gallery`** yang ada di layar **Desktop** komputer Anda.
2. Klik ganda (double-click) file **`index.html`** untuk membukanya di browser (Chrome / Edge / Firefox).
3. Masuk dengan username `razan` dan password `11111111`.

---

## 🌐 Deploy ke GitHub & Vercel

Folder ini sudah dilengkapi file `vercel.json` dan siap di-upload ke GitHub atau langsung di-deploy ke Vercel tanpa konfigurasi rumit.
