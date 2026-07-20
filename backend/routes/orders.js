const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Pesanan = require('../models/Pesanan');
const Menu = require('../models/Menu');
const { protect, adminOnly } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `bukti_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// POST /api/orders — buat pesanan baru
router.post('/', protect, async (req, res) => {
  try {
    const { detail_pesanan, total_harga, metode_pembayaran, alamat_pengiriman, titik_lokasi, biaya_pengiriman, diskon } = req.body;
    
    // Validasi stok
    for (const item of detail_pesanan) {
      const menu = await Menu.findById(item.id_menu);
      if (!menu) return res.status(404).json({ message: `Menu ${item.nama_menu} tidak ditemukan` });
      if (menu.stok < item.jumlah) {
        return res.status(400).json({ message: `Stok ${menu.nama_menu} tidak mencukupi (Tersisa: ${menu.stok})` });
      }
    }

    // Kurangi stok
    for (const item of detail_pesanan) {
      await Menu.findByIdAndUpdate(item.id_menu, { $inc: { stok: -item.jumlah } });
    }

    const pesanan = await Pesanan.create({
      id_pelanggan: req.user._id,
      detail_pesanan,
      total_harga,
      biaya_pengiriman: biaya_pengiriman || 0,
      diskon: diskon || 0,
      metode_pembayaran,
      alamat_pengiriman,
      titik_lokasi,
      pengiriman: { status_pengiriman: 'Menunggu Konfirmasi' }
    });
    res.status(201).json(pesanan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my — pesanan milik user login
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Pesanan.find({ id_pelanggan: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id — detail pesanan
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Pesanan.findById(req.params.id).populate('id_pelanggan', 'nama email nomor_telepon');
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    // Hanya admin atau pemilik yang bisa lihat
    if (order.id_pelanggan._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/orders/:id/bukti — upload bukti transfer
router.put('/:id/bukti', protect, upload.single('bukti'), async (req, res) => {
  try {
    const order = await Pesanan.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    order.bukti_pembayaran = req.file ? `/uploads/${req.file.filename}` : '';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
