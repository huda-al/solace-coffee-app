# Pembedahan Kode Website Solace Coffee

Dokumen ini berisi penjelasan struktur kode dan arsitektur dari website Solace Coffee yang menggunakan teknologi **MERN Stack** (MongoDB, Express, React, Node.js).

---

## 1. Arsitektur Secara Umum
Website ini terbagi menjadi dua bagian utama:
- **Frontend** (Antarmuka Pengguna) yang dibangun dengan **React.js**.
- **Backend** (Server dan API) yang dibangun dengan **Node.js** dan framework **Express**, serta menggunakan **MongoDB** sebagai database.

---

## 2. Pembedahan Backend (Folder `backend/`)
Backend bertugas untuk mengelola data, mengatur logika bisnis, dan berkomunikasi dengan database.

### a. Models (`backend/models/`)
Ini adalah representasi tabel (koleksi) di dalam database MongoDB, dibuat menggunakan *Mongoose*:
*   **`Menu.js`**: Skema data untuk produk/menu kopi (nama, harga, deskripsi, gambar).
*   **`Pelanggan.js`**: Skema data untuk pengguna atau pelanggan (nama, email, password yang dienkripsi).
*   **`Pesanan.js`**: Skema data untuk mencatat transaksi pesanan (menu yang dipesan, total harga, status pesanan, lokasi pengiriman).

### b. Routes (`backend/routes/`)
Ini adalah *endpoint* atau jalur API yang diakses oleh Frontend:
*   **`auth.js`**: Mengelola proses Registrasi, Login, dan pembuatan token JWT (JSON Web Token) untuk keamanan.
*   **`menu.js`**: Menyediakan data menu kopi ke frontend (proses baca data).
*   **`orders.js`**: Mengelola proses checkout pesanan, menyimpan riwayat pesanan pelanggan.
*   **`admin.js`**: Jalur khusus untuk *Admin Dashboard* (misalnya: menambah menu baru, memproses status pesanan).

---

## 3. Pembedahan Frontend (Folder `frontend/`)
Frontend adalah apa yang dilihat dan berinteraksi langsung dengan pelanggan atau admin.

### a. Halaman / Pages (`frontend/src/pages/`)
Komponen utama yang mewakili satu halaman penuh (URL tertentu):
*   **`MenuPage.jsx`**: Halaman utama yang menampilkan daftar menu (katalog).
*   **`CheckoutPage.jsx`**: Halaman keranjang belanja untuk mengonfirmasi pesanan dan alamat pengiriman.
*   **`StatusPage.jsx`**: Halaman bagi pelanggan untuk melacak status pesanan mereka (misal: "Diproses", "Dikirim").
*   **`AdminDashboard.jsx`**: Halaman panel kontrol khusus admin (mengatur pesanan masuk dan stok menu).
*   **`LoginPage.jsx` & `RegisterPage.jsx`**: Halaman untuk pengguna membuat akun dan masuk ke dalam sistem.
*   **`AboutPage.jsx`**: Halaman informasi profil tentang Solace Coffee.

### b. Komponen Tambahan (`frontend/src/components/`)
Komponen-komponen UI yang bisa dipakai berulang kali (reusable):
*   **`Navbar.jsx`**: Bilah navigasi atas (berisi logo, link halaman, dan tombol keranjang).
*   **`LocationPicker.jsx`**: Komponen interaktif (peta) untuk memilih titik koordinat alamat pengiriman, kemungkinan menggunakan *Leaflet*.

---

## 4. Berkas Konfigurasi Penting
*   **`package.json`**: Mencatat semua pustaka (*library*) yang diinstal, seperti `react`, `express`, `mongoose`, dll.
*   **`index.css`**: Menyimpan semua kode CSS global untuk mendesain tampilan website agar terlihat rapi.
*   **`.env`**: File *Environment Variables* di backend yang menyimpan data rahasia seperti koneksi MongoDB (`MONGO_URI`) dan kunci token (`JWT_SECRET`).

---
*Dibuat oleh AI Assistant.*
