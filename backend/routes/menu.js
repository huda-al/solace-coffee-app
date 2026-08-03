const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Menu = require('../models/Menu');
const { protect, adminOnly } = require('../middleware/auth');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `menu_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// GET /api/menu — semua menu (public)
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.find({ tersedia: true }).sort({ kategori: 1, nama_menu: 1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/all — semua menu termasuk tidak tersedia (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const menus = await Menu.find().sort({ kategori: 1, nama_menu: 1 });
    res.json(menus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu — tambah menu (admin)
router.post('/', protect, adminOnly, upload.single('gambar'), async (req, res) => {
  try {
    const { nama_menu, deskripsi, harga, kategori, stok } = req.body;
    const gambar = req.file ? `/uploads/${req.file.filename}` : '';
    const menu = await Menu.create({ nama_menu, deskripsi, harga, kategori, stok, gambar });
    res.status(201).json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}); 

// PUT /api/menu/:id — update menu (admin)
router.put('/:id', protect, adminOnly, upload.single('gambar'), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.gambar = `/uploads/${req.file.filename}`;
    const menu = await Menu.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!menu) return res.status(404).json({ message: 'Menu tidak ditemukan' });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/menu/:id — hapus menu (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ message: 'Menu dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
