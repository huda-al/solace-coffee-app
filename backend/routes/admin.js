const express = require('express');
const router = express.Router();
const Pesanan = require('../models/Pesanan');
const Menu = require('../models/Menu');
const Pelanggan = require('../models/Pelanggan');
const { protect, adminOnly } = require('../middleware/auth');

// Semua route admin butuh protect + adminOnly
router.use(protect, adminOnly);

// GET /api/admin/dashboard — statistik harian
router.get('/dashboard', async (req, res) => {
  try {
    const totalPesanan = await Pesanan.countDocuments();
    const totalPelanggan = await Pelanggan.countDocuments({ role: 'pelanggan' });
    const totalMenu = await Menu.countDocuments();
    const pesananPending = await Pesanan.countDocuments({ status_pesanan: 'Menunggu Konfirmasi' });

    const pendapatan = await Pesanan.aggregate([
      { $match: { status_pesanan: 'Pesanan Telah Selesai' } },
      { $group: { _id: null, total: { $sum: '$total_harga' } } }
    ]);

    const recentOrders = await Pesanan.find()
      .populate('id_pelanggan', 'nama email')
      .sort({ createdAt: -1 })
      .limit(5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rawChartData = await Pesanan.aggregate([
      { 
        $match: { 
          status_pesanan: 'Pesanan Telah Selesai',
          tanggal_pesanan: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$tanggal_pesanan", timezone: "+07:00" } },
          totalPendapatan: { $sum: '$total_harga' },
          jumlahPesanan: { $sum: 1 }
        }
      }
    ]);

    const chartData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      // Need a stable way to get YYYY-MM-DD
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const found = rawChartData.find(c => c._id === dateStr);
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      
      chartData.push({
        date: dateStr,
        day: dayNames[d.getDay()],
        pendapatan: found ? found.totalPendapatan : 0,
        pesanan: found ? found.jumlahPesanan : 0
      });
    }

    res.json({
      totalPesanan,
      totalPelanggan,
      totalMenu,
      pesananPending,
      totalPendapatan: pendapatan[0]?.total || 0,
      recentOrders,
      chartData
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/orders — semua pesanan
router.get('/orders', async (req, res) => {
  try {
    const orders = await Pesanan.find()
      .populate('id_pelanggan', 'nama email nomor_telepon')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/orders/:id/status — update status pesanan
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status_pesanan } = req.body;
    const order = await Pesanan.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

    order.status_pesanan = status_pesanan;
    order.pengiriman.status_pengiriman = status_pesanan;
    if (status_pesanan === 'Pesanan Sedang Dikirim') {
      order.pengiriman.waktu_pengiriman = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/orders/:id — update detail pesanan (edit items/qty)
router.put('/orders/:id', async (req, res) => {
  try {
    const { detail_pesanan, total_harga } = req.body;
    const order = await Pesanan.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Pesanan tidak ditemukan' });

    if (detail_pesanan) order.detail_pesanan = detail_pesanan;
    if (total_harga !== undefined) order.total_harga = total_harga;
    
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
