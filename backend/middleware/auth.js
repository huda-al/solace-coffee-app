const jwt = require('jsonwebtoken');
const Pelanggan = require('../models/Pelanggan');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await Pelanggan.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
  }
  if (!token) {
    return res.status(401).json({ message: 'Tidak ada token, akses ditolak' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses admin saja' });
  }
};

module.exports = { protect, adminOnly };
