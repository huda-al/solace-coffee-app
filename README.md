# ☕ Solace Coffee — Website Sistem Pesan Antar

Tugas Akhir: Perancangan Website Sistem Pesan Antar Solace Coffee Berbasis Web  
Oleh: M. Huda Al-Amin (2208001010034)  
Program Studi D-III Manajemen Informatika, FMIPA — Universitas Syiah Kuala

---

## 🛠 Tech Stack
| Layer     | Teknologi                        |
|-----------|----------------------------------|
| Frontend  | React 18, React Router v6, Axios |
| Backend   | Node.js, Express.js              |
| Database  | MongoDB (Mongoose ODM)           |
| Auth      | JWT (JSON Web Token) + bcryptjs  |
| Style     | CSS custom (brand Solace Coffee) |

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- Node.js v18+
- MongoDB (jalankan lokal: `mongod`)

### 2. Setup Backend
```bash
cd backend
cp .env.example .env        # Salin config
npm install                  # Install dependencies
node seed.js                 # Isi data awal (menu + admin)
npm run dev                  # Jalankan server (port 5000)
```

### 3. Setup Frontend
```bash
cd frontend
npm install                  # Install dependencies
npm start                    # Jalankan React (port 3000)
```

### 4. Buka Browser
- **Website pelanggan**: http://localhost:3000
- **API backend**: http://localhost:5000

---

## 👤 Akun Default (setelah seed)
| Role    | Email                        | Password   |
|---------|------------------------------|------------|
| Admin   | admin@solacecoffee.com       | admin123   |

---

## 📁 Struktur Project
```
solace-coffee/
├── backend/
│   ├── models/
│   │   ├── Pelanggan.js      # Model user/pelanggan
│   │   ├── Menu.js           # Model menu kopi
│   │   └── Pesanan.js        # Model pesanan + detail + pengiriman
│   ├── routes/
│   │   ├── auth.js           # Register & Login
│   │   ├── menu.js           # CRUD menu
│   │   ├── orders.js         # Buat & lihat pesanan
│   │   └── admin.js          # Dashboard & manajemen admin
│   ├── middleware/
│   │   └── auth.js           # JWT middleware
│   ├── server.js             # Entry point Express
│   ├── seed.js               # Script isi data awal
│   └── .env.example
│
└── frontend/
    └── src/
        ├── context/
        │   ├── AuthContext.jsx   # State user (login/logout)
        │   └── CartContext.jsx   # State keranjang belanja
        ├── components/
        │   └── Navbar.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── MenuPage.jsx          # Katalog menu (Classic, Coffee Base, Non Coffee)
        │   ├── CheckoutPage.jsx      # Keranjang + pembayaran
        │   ├── StatusPage.jsx        # Tracking status pengiriman (stepper)
        │   └── AdminDashboard.jsx    # Dashboard admin (stats + kelola pesanan)
        ├── App.js                    # Router utama
        └── index.css                 # Styling brand Solace Coffee
```

---

## 🎯 Fitur
### Pelanggan
- ✅ Registrasi & Login
- ✅ Lihat menu (Classic / Coffee Base / Non Coffee)
- ✅ Tambah ke keranjang, atur jumlah
- ✅ Checkout dengan metode BSI atau COD
- ✅ Input alamat pengiriman
- ✅ Tracking status pesanan real-time (auto refresh 10 detik)

### Admin
- ✅ Login admin
- ✅ Dashboard statistik (total pesanan, pendapatan, pelanggan)
- ✅ Tabel semua pesanan
- ✅ Update status pesanan: Menunggu Konfirmasi → Pesanan Dibuat → Pesanan Diterima

---

## 🔗 API Endpoints
| Method | Endpoint                        | Deskripsi                   | Auth     |
|--------|---------------------------------|-----------------------------|----------|
| POST   | /api/auth/register              | Daftar pelanggan baru       | -        |
| POST   | /api/auth/login                 | Login                       | -        |
| GET    | /api/menu                       | Semua menu tersedia         | -        |
| POST   | /api/menu                       | Tambah menu                 | Admin    |
| PUT    | /api/menu/:id                   | Edit menu                   | Admin    |
| DELETE | /api/menu/:id                   | Hapus menu                  | Admin    |
| POST   | /api/orders                     | Buat pesanan baru           | User     |
| GET    | /api/orders/my                  | Pesanan milik user          | User     |
| GET    | /api/orders/:id                 | Detail pesanan              | User/Admin|
| GET    | /api/admin/dashboard            | Statistik dashboard         | Admin    |
| GET    | /api/admin/orders               | Semua pesanan               | Admin    |
| PUT    | /api/admin/orders/:id/status    | Update status pesanan       | Admin    |
