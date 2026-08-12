const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pelangganSchema = new mongoose.Schema({
  nama: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  nomor_telepon: { type: String, required: true, trim: true },
  alamat_pengiriman: { type: String, trim: true },
  role: { type: String, enum: ['pelanggan', 'admin'], default: 'pelanggan' }
}, { timestamps: true });


pelangganSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


pelangganSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Pelanggan', pelangganSchema);
