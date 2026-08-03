const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Menu = require('./models/Menu');
const Pelanggan = require('./models/Pelanggan');

dotenv.config();

const menuData = [
  // Classic
  { nama_menu: 'Americano', deskripsi: 'Kopi hitam klasik tanpa susu', harga: 18000, kategori: 'Classic', stok: 50, gambar: '' },
  { nama_menu: 'Latte', deskripsi: 'Kopi dengan susu lembut', harga: 20000, kategori: 'Classic', stok: 50, gambar: '' },

  // Coffee Base
  { nama_menu: 'Sanger', deskripsi: 'Kopi espresso dengan susu kental manis khas Aceh', harga: 20000, kategori: 'Coffee Base', stok: 50, gambar: '' },
  { nama_menu: 'Barrel Brew', deskripsi: 'Cold brew unik dengan aroma khas', harga: 28000, kategori: 'Coffee Base', stok: 50, gambar: '' },
  { nama_menu: 'Bomberry', deskripsi: 'Perpaduan kopi dan segarnya buah berry', harga: 28000, kategori: 'Coffee Base', stok: 50, gambar: '' },
  { nama_menu: 'Evergreen Latte', deskripsi: 'Signature latte dengan nuansa rasa yang menenangkan', harga: 28000, kategori: 'Coffee Base', stok: 50, gambar: '' },

  // Non Coffee
  { nama_menu: 'Chocolate', deskripsi: 'Cokelat premium yang kaya rasa', harga: 22000, kategori: 'Non Coffee', stok: 50, gambar: '' },
  { nama_menu: 'Matcha', deskripsi: 'Matcha green tea berkualitas pilihan', harga: 25000, kategori: 'Non Coffee', stok: 50, gambar: '' },
  { nama_menu: 'Caribbean Night', deskripsi: 'Minuman segar dengan sensasi buah tropis', harga: 28000, kategori: 'Non Coffee', stok: 50, gambar: '' },
  { nama_menu: 'Mastachio', deskripsi: 'Kombinasi unik matcha dan pistachio', harga: 28000, kategori: 'Non Coffee', stok: 50, gambar: '' },
  { nama_menu: 'Lemon Squash', deskripsi: 'Perasan lemon segar dengan soda', harga: 20000, kategori: 'Non Coffee', stok: 50, gambar: '' },
  { nama_menu: 'Lemonade', deskripsi: 'Air lemon segar manis dan asam', harga: 18000, kategori: 'Non Coffee', stok: 50, gambar: '' },
  { nama_menu: 'Chocomint Dream', deskripsi: 'Cokelat nikmat dengan sensasi mint yang dingin', harga: 26000, kategori: 'Non Coffee', stok: 50, gambar: '' },
  { nama_menu: 'Choco Vanilla', deskripsi: 'Paduan sempurna cokelat dan kelembutan vanilla', harga: 25000, kategori: 'Non Coffee', stok: 50, gambar: '' },

  // Tea Series
  { nama_menu: 'Chamomile', deskripsi: 'Teh chamomile yang menenangkan', harga: 18000, kategori: 'Tea Series', stok: 50, gambar: '' },
  { nama_menu: 'Peppermint', deskripsi: 'Teh peppermint segar yang menenangkan', harga: 18000, kategori: 'Tea Series', stok: 50, gambar: '' },
  { nama_menu: 'Darjeeling', deskripsi: 'Teh hitam premium dari pegunungan Himalaya', harga: 18000, kategori: 'Tea Series', stok: 50, gambar: '' },
];

const adminData = {
  nama: 'Zakisyah',
  email: 'admin@solacecoffee.com',
  password: 'admin123',
  nomor_telepon: '081234567890',
  role: 'admin'
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await Menu.deleteMany();
    await Pelanggan.deleteMany({ role: 'admin' });

    // Insert menu
    await Menu.insertMany(menuData);
    console.log(`✅ ${menuData.length} menu items seeded`);

    // Insert admin
    await Pelanggan.create(adminData);
    console.log('✅ Admin account created: admin@solacecoffee.com / admin123');

    mongoose.disconnect();
    console.log('🎉 Seed selesai!');
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
