const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Pelanggan = require('../models/Pelanggan');

const JWT_SECRET = process.env.JWT_SECRET || 'solace_coffee_secret_key_2026';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nama, email, password, nomor_telepon, alamat_pengiriman } = req.body;
    if (!nomor_telepon) return res.status(400).json({ message: 'Nomor WhatsApp wajib diisi' });
    const exists = await Pelanggan.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email sudah terdaftar' });

    const user = await Pelanggan.create({ nama, email, password, nomor_telepon, alamat_pengiriman });
    res.status(201).json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      alamat_pengiriman: user.alamat_pengiriman,
      nomor_telepon: user.nomor_telepon,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Pelanggan.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }
    res.json({
      _id: user._id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      alamat_pengiriman: user.alamat_pengiriman,
      nomor_telepon: user.nomor_telepon,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
