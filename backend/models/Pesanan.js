const mongoose = require('mongoose');

const detailPesananSchema = new mongoose.Schema({
  id_menu: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  nama_menu: { type: String, required: true },
  harga: { type: Number, required: true },
  jumlah: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }
});

const pesananSchema = new mongoose.Schema({
  id_pelanggan: { type: mongoose.Schema.Types.ObjectId, ref: 'Pelanggan', required: true },
  detail_pesanan: [detailPesananSchema],
  total_harga: { type: Number, required: true },
  biaya_pengiriman: { type: Number, default: 0 },
  diskon: { type: Number, default: 0 },
  tanggal_pesanan: { type: Date, default: Date.now },
  metode_pembayaran: {
    type: String,
    enum: ['QRIS', 'COD'],
    required: true
  },
  bukti_pembayaran: { type: String, default: '' },
  status_pesanan: {
    type: String,
    enum: ['Menunggu Konfirmasi', 'Pesanan Dibuat', 'Pesanan Sedang Dikirim', 'Pesanan Telah Selesai', 'Dibatalkan'],
    default: 'Menunggu Konfirmasi'
  },
  alamat_pengiriman: { type: String, required: true },
  titik_lokasi: {
    lat: { type: Number },
    lng: { type: Number }
  },
  pengiriman: {
    status_pengiriman: {
      type: String,
      enum: ['Menunggu Konfirmasi', 'Pesanan Dibuat', 'Pesanan Sedang Dikirim', 'Pesanan Telah Selesai'],
      default: 'Menunggu Konfirmasi'
    },
    waktu_pengiriman: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('Pesanan', pesananSchema);
