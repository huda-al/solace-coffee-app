import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LocationPicker from '../components/LocationPicker';
import blackImg from '../assets/black.jpg';
import whiteImg from '../assets/white.jpg';
import matchaImg from '../assets/matcha.jpg';
import chocomintImg from '../assets/chocomint.jpg';
import lemonadeImg from '../assets/lemonade.jpg';
import lemonsquashImg from '../assets/lemonsquash.jpg';
import chocolateImg from '../assets/chocolate.jpg';
import sangerImg from '../assets/sanger.jpg';
import bomberryImg from '../assets/bomberry.jpg';
import chamomileImg from '../assets/chamomile.jpg';
import peppermintImg from '../assets/peppermint.jpg';
import darjeelingImg from '../assets/darjeeling.jpg';

const ShoppingCartIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);

const CoffeeCupIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>
);

export default function CheckoutPage() {
  const { cart, updateQty, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metode, setMetode] = useState('COD');
  const [alamat, setAlamat] = useState(user?.alamat_pengiriman || '');
  const [loading, setLoading] = useState(false);

  // New states for Shipping & Promo
  const [distance, setDistance] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState(null);
  const [variants, setVariants] = useState({});
  const [titikLokasi, setTitikLokasi] = useState(null);
  
  // Modal state
  const [showQrisModal, setShowQrisModal] = useState(false);

  const getMenuImage = (item) => {
    let imgSrc = item.gambar || null;
    let objPos;
    if (!item.nama_menu) return { imgSrc, objPos };
    const name = item.nama_menu.toLowerCase();
    
    if (name === 'americano' || name.includes('americano')) imgSrc = blackImg;
    else if (name === 'latte' || name.includes('latte')) imgSrc = whiteImg;
    else if (name === 'sanger' || name === 'barrel brew') { imgSrc = sangerImg; objPos = 'center 80%'; }
    else if (name === 'bomberry') imgSrc = bomberryImg;
    else if (name === 'matcha' || name === 'mastachio') imgSrc = matchaImg;
    else if (name === 'chocomint dream' || name.includes('chocomint')) imgSrc = chocomintImg;
    else if (name === 'chocolate' || name === 'choco vanilla' || name === 'caribbean night') { imgSrc = chocolateImg; objPos = 'center 75%'; }
    else if (name === 'lemonade' || name.includes('lemonade')) imgSrc = lemonadeImg;
    else if (name === 'lemon squash' || name.includes('squash')) imgSrc = lemonsquashImg;
    else if (name === 'chamomile' || name.includes('chamomile')) imgSrc = chamomileImg;
    else if (name === 'peppermint' || name.includes('peppermint')) imgSrc = peppermintImg;
    else if (name === 'darjeeling' || name.includes('darjeeling')) imgSrc = darjeelingImg;

    return { imgSrc, objPos };
  };

  // Haversine calculation
  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleCoordinatesChange = (latlng) => {
    if (!latlng || !latlng.lat || !latlng.lng) return;
    setTitikLokasi({ lat: latlng.lat, lng: latlng.lng });
    const dist = getDistanceFromLatLonInKm(5.569361, 95.355377, latlng.lat, latlng.lng);
    setDistance(dist);

    let ongkir = 0;
    if (dist > 1) {
      ongkir = 2000 + Math.floor(dist - 1) * 1000;
    }
    setShippingCost(ongkir);
  };

  const applyPromo = () => {
    if (!promoInput) return;
    const code = promoInput.toUpperCase();
    if (code === 'PROMO20') {
      setActivePromo({ code, type: 'percent', val: 0.2 });
      toast.success('Kupon PROMO20 berhasil dipasang! (Diskon 20%)');
    } else if (code === 'GRATISONGKIR') {
      setActivePromo({ code, type: 'shipping', val: 0 });
      toast.success('Kupon GRATISONGKIR berhasil dipasang!');
    } else {
      toast.error('Kupon tidak valid atau kadaluarsa.');
      setActivePromo(null);
    }
  };

  // Calculate totals
  let finalShipping = shippingCost;
  let finalDiscount = 0;

  if (activePromo?.type === 'percent') {
    finalDiscount = total * activePromo.val;
  } else if (activePromo?.type === 'shipping') {
    finalDiscount = shippingCost;
  }

  const grandTotal = total + finalShipping - finalDiscount;

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div style={{ marginBottom: 16, color: 'var(--text-muted)', display: 'flex', justifyContent: 'center' }}><ShoppingCartIcon size={48} /></div>
        <p style={{ fontSize: 18, marginBottom: 20 }}>Keranjang kosong</p>
        <button className="btn-primary" onClick={() => navigate('/menu')}>Lihat Menu</button>
      </div>
    );
  }

  const submitOrder = async () => {
    setLoading(true);
    try {
      const detail_pesanan = cart.map(item => ({
        id_menu: item._id,
        nama_menu: `${item.nama_menu} (${variants[item._id] || 'Ice'})`,
        harga: item.harga,
        jumlah: item.jumlah,
        subtotal: item.harga * item.jumlah
      }));
      const res = await axios.post('/api/orders', {
        detail_pesanan,
        total_harga: grandTotal,
        biaya_pengiriman: finalShipping,
        diskon: finalDiscount,
        metode_pembayaran: metode,
        alamat_pengiriman: alamat,
        titik_lokasi: titikLokasi
      });
      clearCart();
      setShowQrisModal(false);
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/status/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = () => {
    if (!user) { toast.error('Login dulu ya!'); return navigate('/login'); }
    if (!alamat.trim()) { toast.error('Isi alamat pengiriman dulu!'); return; }

    if (metode === 'QRIS') {
      setShowQrisModal(true);
    } else {
      submitOrder();
    }
  };

  return (
    <div className="page-container fade-in" style={{ padding: '40px 24px 60px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 36, margin: 0 }}>Checkout</h1>
        <button onClick={() => navigate('/menu')} style={{ background: 'transparent', border: '1.5px solid var(--dark-red)', color: 'var(--dark-red)', padding: '8px 16px', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          ← Tambah Menu Lain
        </button>
      </div>

      <div className="checkout-layout" style={s.layout}>
        {/* Orders */}
        <div style={s.ordersCard}>
          <h2 style={s.sectionTitle}>Orders</h2>
          {cart.map(item => {
            const { imgSrc, objPos } = getMenuImage(item);
            return (
              <div key={item._id} style={s.orderRow}>
                <input type="checkbox" defaultChecked style={{ marginRight: 12, accentColor: 'var(--dark-red)' }} />
                <div style={{ ...s.itemImg, padding: imgSrc ? 0 : undefined, background: imgSrc ? 'transparent' : '#5c3520', color: 'var(--light-tan)' }}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.nama_menu} style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover', objectPosition: objPos || 'center' }} />
                  ) : (
                    <CoffeeCupIcon size={24} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={s.itemName}>{item.nama_menu}</p>
                  <p style={s.itemPrice}>Rp {item.harga.toLocaleString('id-ID')}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    {['Ice', 'Hot'].map(v => {
                      const isSelected = (variants[item._id] || 'Ice') === v;
                      return (
                        <button
                          key={v}
                          onClick={() => setVariants({ ...variants, [item._id]: v })}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 6,
                            border: 'none',
                            background: isSelected ? 'var(--dark-red)' : 'var(--light-tan)',
                            color: isSelected ? 'white' : 'var(--dark-red)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: 11
                          }}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={s.qtyWrap}>
                  <button style={s.qtyBtn} onClick={() => updateQty(item._id, item.jumlah - 1)}>−</button>
                  <span style={s.qtyNum}>{item.jumlah}</span>
                  <button style={s.qtyBtn} onClick={() => updateQty(item._id, item.jumlah + 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={s.summaryCard}>
          <h2 style={s.sectionTitle}>Summary</h2>

          <div style={{ marginBottom: 20 }}>
            <p style={s.label}>Location:</p>
            <LocationPicker value={alamat} onChange={setAlamat} onCoordinatesChange={handleCoordinatesChange} />
            <textarea
              className="input-field"
              style={{ borderRadius: 10, resize: 'none', height: 60, marginTop: 8, fontSize: 12 }}
              placeholder="Atau ketik alamat manual..."
              value={alamat}
              onChange={e => setAlamat(e.target.value)}
            />
            {distance > 0 && (
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Jarak pengiriman: {distance.toFixed(1)} km
              </p>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={s.label}>Makin Hemat Pakai Kupon!</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Cth: PROMO20"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, textTransform: 'uppercase' }}
              />
              <button
                onClick={applyPromo}
                style={{ padding: '10px 16px', background: 'var(--dark-red)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                Pakai
              </button>
            </div>
            {activePromo && (
              <p style={{ fontSize: 11, color: '#4caf50', marginTop: 6, fontWeight: 600 }}>
                ✓ Kupon {activePromo.code} aktif
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <p style={s.label}>Payment Methode</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {['QRIS', 'COD'].map(m => (
                <button key={m} style={{ ...s.payBtn, ...(metode === m ? s.payActive : {}) }} onClick={() => setMetode(m)}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border)', margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            <div style={s.summaryRow}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <div style={s.summaryRow}>
              <span style={{ color: 'var(--text-muted)' }}>Ongkos Kirim</span>
              <span>Rp {finalShipping.toLocaleString('id-ID')}</span>
            </div>
            {finalDiscount > 0 && (
              <div style={{ ...s.summaryRow, color: '#4caf50', fontWeight: 600 }}>
                <span>Diskon Kupon</span>
                <span>- Rp {finalDiscount.toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>

          <div style={s.totalRow}>
            <span style={{ fontWeight: 600 }}>Total</span>
            <span style={s.totalAmt}>Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>

          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: 10, marginTop: 24 }} onClick={handleOrder} disabled={loading}>
            {loading ? 'Memproses...' : 'Pay now'}
          </button>
        </div>
      </div>

      {/* QRIS Modal Overlay */}
      {showQrisModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 20, width: '100%', maxWidth: 400, textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontFamily: "'Fraunces', sans-serif", fontSize: 24, color: 'var(--dark-red)', marginBottom: 8 }}>Pembayaran QRIS</h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Scan kode QR di bawah ini menggunakan aplikasi M-Banking atau e-Wallet Anda.</p>

            <div style={{ padding: 16, border: '2px dashed var(--border)', borderRadius: 16, display: 'inline-block', marginBottom: 20, background: '#f9f9f9' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=SolaceCoffee_${grandTotal}`} alt="QRIS Code" style={{ width: 200, height: 200 }} />
            </div>

            <div style={{ background: '#f1e8dc', padding: 16, borderRadius: 12, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Total Tagihan</p>
              <p style={{ fontFamily: "'Fraunces', sans-serif", fontSize: 28, color: 'var(--dark-red)', fontWeight: 700 }}>Rp {grandTotal.toLocaleString('id-ID')}</p>
            </div>

            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', borderRadius: 10, padding: 14, fontSize: 16, marginBottom: 12 }}
              onClick={submitOrder}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Saya Sudah Membayar'}
            </button>
            <button
              style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: 'transparent', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
              onClick={() => setShowQrisModal(false)}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  title: { fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 36, marginBottom: 28 },
  layout: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'start' },
  ordersCard: { background: '#e8e0d4', borderRadius: 16, padding: 24 },
  summaryCard: { background: '#e8e0d4', borderRadius: 16, padding: 24, position: 'sticky', top: 90 },
  sectionTitle: { fontFamily: "'Fraunces', sans-serif", fontSize: 22, color: 'var(--dark-red)', marginBottom: 20 },
  orderRow: { display: 'flex', alignItems: 'center', marginBottom: 20, gap: 8 },
  itemImg: { width: 56, height: 56, background: '#5c3520', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 },
  itemName: { fontFamily: "'Fraunces', sans-serif", fontSize: 18, color: 'var(--dark-red)', fontWeight: 700 },
  itemPrice: { fontSize: 14, color: 'var(--text-muted)' },
  qtyWrap: { display: 'flex', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 6, background: 'var(--light-tan)', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 16, color: 'var(--dark-red)' },
  qtyNum: { width: 32, height: 32, background: 'var(--light-tan)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 },
  label: { fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-dark)' },
  payBtn: { padding: '10px 24px', borderRadius: 10, border: 'none', background: 'var(--light-tan)', color: 'var(--dark-red)', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  payActive: { background: 'var(--dark-red)', color: 'white' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  totalAmt: { fontFamily: "'Fraunces', sans-serif", fontSize: 24, color: 'var(--dark-red)', fontWeight: 700 },
};
