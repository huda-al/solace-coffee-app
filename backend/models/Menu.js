const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  nama_menu: { type: String, required: true, trim: true },
  deskripsi: { type: String, trim: true },
  harga: { type: Number, required: true, min: 0 },
  kategori: {
    type: String,
    required: true,
    enum: ['Classic', 'Coffee Base', 'Non Coffee', 'Tea Series'],
  },
  stok: { type: Number, default: 0, min: 0 },
  gambar: { type: String, default: '' },
  tersedia: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Menu', menuSchema);
