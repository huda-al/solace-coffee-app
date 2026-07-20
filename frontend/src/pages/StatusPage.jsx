import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coffee, Receipt, PartyPopper, Bike, MapPin, CreditCard, Clock } from 'lucide-react';

const STEPS = ['Menunggu Konfirmasi', 'Pesanan Dibuat', 'Pesanan Sedang Dikirim', 'Pesanan Telah Selesai'];

export default function StatusPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = () => axios.get(`/api/orders/${id}`).then(r => { setOrder(r.data); setLoading(false); });
    fetch();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetch, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="loading">Memuat status pesanan...</div>;
  if (!order) return <div className="loading">Pesanan tidak ditemukan</div>;

  const currentStep = STEPS.indexOf(order.pengiriman.status_pengiriman);

  return (
    <div className="page-container fade-in" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 800, margin: '0 auto' }}>
      <h1 style={s.title}>Waiting for order</h1>

      {/* Stepper */}
      <div style={s.stepperCard}>
        <div style={s.stepperContainer}>
          {STEPS.map((step, i) => (
            <div key={step} style={s.stepWrapper}>
              <div style={s.stepTop}>
                <div 
                  className={i === currentStep ? 'step-active' : ''}
                  style={{
                  ...s.stepCircle,
                  background: i <= currentStep ? 'var(--dark-red)' : 'var(--light-tan)',
                  border: i === currentStep ? '3px solid var(--dark-red)' : '2px solid transparent',
                  outline: i === currentStep ? '3px solid var(--light-tan)' : 'none',
                }}>
                  {i < currentStep ? '✓' : ''}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={s.stepLine}>
                    <div style={{ position: 'absolute', width: '100%', height: '100%', borderTop: '2px dashed var(--light-tan)' }} />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: 2,
                      width: i < currentStep ? '100%' : '0%',
                      background: 'var(--dark-red)',
                      transition: 'width 0.8s ease-in-out'
                    }} />
                  </div>
                )}
              </div>
              <span style={{ ...s.stepLabel, color: i <= currentStep ? 'var(--dark-red)' : 'var(--text-muted)', fontWeight: i === currentStep ? 700 : 400 }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={s.infoBox} key={currentStep} className="fade-in">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          background: 'rgba(122, 26, 26, 0.05)',
          border: '1px solid rgba(122, 26, 26, 0.1)',
          borderRadius: 12,
          padding: '16px 24px',
          maxWidth: 500,
          margin: '0 auto',
        }}>
          {currentStep === 0 && <Clock size={28} color="var(--dark-red)" style={{ flexShrink: 0 }} />}
          {currentStep === 1 && <PartyPopper size={28} color="var(--dark-red)" style={{ flexShrink: 0 }} />}
          {currentStep === 2 && <Bike size={28} color="var(--dark-red)" style={{ flexShrink: 0 }} />}
          {currentStep === 3 && <Coffee size={28} color="var(--dark-red)" style={{ flexShrink: 0 }} />}
          
          <span style={{ fontSize: 14, color: 'var(--dark-red)', fontWeight: 600, lineHeight: 1.5, textAlign: 'left' }}>
            {currentStep === 0 && 'Mohon tunggu, pesanan Anda sedang menunggu konfirmasi admin.'}
            {currentStep === 1 && 'Pesanan sedang disiapkan dan diracik oleh tim Solace Coffee.'}
            {currentStep === 2 && 'Pesanan sedang dalam perjalanan menuju lokasi Anda.'}
            {currentStep === 3 && 'Pesanan telah selesai! Selamat menikmati kopi Anda.'}
          </span>
        </div>
      </div>

      {/* Order detail / Receipt */}
      <div style={{ ...s.detailCard, ...(currentStep === 3 ? s.receiptCard : {}) }}>
        {currentStep === 3 ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 28, margin: 0, letterSpacing: 2 }}>SOLACE COFFEE</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>Jl. T. Nyak Arief, Banda Aceh</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Tel: 0812-3456-7890</p>
              <div style={{ margin: '16px 0', borderBottom: '2px dashed #d1bba4' }}></div>
              <h3 style={{ fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 20, margin: 0, textAlign: 'center' }}>
                E-RECEIPT
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                ORDER ID: {order._id.substring(0, 10).toUpperCase()}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                WAKTU: {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
              </p>
            </div>

            <div style={{ margin: '16px 0', borderBottom: '2px dashed #d1bba4' }}></div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text-dark)' }}>ITEMS:</p>
              {order.detail_pesanan.map((d, i) => (
                <div key={i} style={{ ...s.detailRow, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.nama_menu}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.jumlah} x Rp {(d.harga || (d.subtotal/d.jumlah)).toLocaleString('id-ID')}</div>
                  </div>
                  <div style={{ fontWeight: 600 }}>Rp {d.subtotal.toLocaleString('id-ID')}</div>
                </div>
              ))}
            </div>

            <div style={{ margin: '16px 0', borderBottom: '2px dashed #d1bba4' }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>Rp {order.detail_pesanan.reduce((sum, d) => sum + d.subtotal, 0).toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--text-muted)' }}>
              <span>Biaya Pengiriman</span>
              <span>{order.biaya_pengiriman > 0 ? `Rp ${order.biaya_pengiriman.toLocaleString('id-ID')}` : 'Gratis'}</span>
            </div>
            {order.diskon > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: '#4caf50', fontWeight: 600 }}>
                <span>Diskon Kupon</span>
                <span>- Rp {order.diskon.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--text-muted)' }}>
              <span>Pajak (Termasuk)</span>
              <span>Rp 0</span>
            </div>

            <div style={{ margin: '16px 0', borderBottom: '2px dashed #d1bba4' }}></div>

            <div style={{ ...s.detailRow, fontWeight: 800, fontSize: 18, alignItems: 'center' }}>
              <span>TOTAL BELANJA</span>
              <span style={{ color: 'var(--dark-red)' }}>Rp {order.total_harga.toLocaleString('id-ID')}</span>
            </div>

            <div style={{ margin: '16px 0', borderBottom: '2px dashed #d1bba4' }}></div>

            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
              <div style={{ marginBottom: 4 }}><span style={{ fontWeight: 600 }}>PEMBAYARAN:</span> {order.metode_pembayaran}</div>
              <div><span style={{ fontWeight: 600 }}>PENGIRIMAN:</span> {order.alamat_pengiriman}</div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <p style={{ fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 16, margin: 0 }}>THANK YOU!</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>Semoga harimu menyenangkan dengan secangkir kopi.</p>
              <div style={{ marginTop: 16, opacity: 0.3 }}>|| | || || | || | | || ||| ||</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 22, margin: 0 }}>
                Detail Pesanan
              </h3>
            </div>
            {order.detail_pesanan.map((d, i) => (
              <div key={i} style={s.detailRow}>
                <span>{d.nama_menu} × {d.jumlah}</span>
                <span>Rp {d.subtotal.toLocaleString('id-ID')}</span>
              </div>
            ))}
            <hr style={{ borderTop: '1px solid var(--border)', borderBottom: 'none', margin: '16px 0' }} />
            <div style={{ ...s.detailRow, fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--dark-red)', fontSize: 18 }}>Rp {order.total_harga.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, padding: '14px 16px', background: 'var(--light-tan)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <MapPin size={16} color="var(--dark-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.5, textAlign: 'left', fontWeight: 500 }}>
                  {order.alamat_pengiriman}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <CreditCard size={16} color="var(--dark-red)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--text-dark)', lineHeight: 1.5, textAlign: 'left', fontWeight: 500 }}>
                  {order.metode_pembayaran}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status tag & Action */}
      <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <span className={`tag tag-${order.status_pesanan === 'Menunggu Konfirmasi' ? 'menunggu' : order.status_pesanan === 'Pesanan Dibuat' ? 'dibuat' : order.status_pesanan === 'Pesanan Sedang Dikirim' ? 'diterima' : order.status_pesanan === 'Pesanan Telah Selesai' ? 'selesai' : 'batal'}`} style={{ fontSize: 14, padding: '8px 20px' }}>
          {order.status_pesanan}
        </span>

        {currentStep === 3 && (
          <button className="btn-primary fade-in" style={{ padding: '12px 32px' }} onClick={() => navigate('/menu')}>
            ← Kembali ke Menu Utama
          </button>
        )}
      </div>
    </div>
  );
}

const s = {
  title: { fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 32, marginBottom: 28, textAlign: 'center' },
  stepperCard: { background: '#e8e0d4', borderRadius: 16, padding: '32px 24px', marginBottom: 28 },
  stepperContainer: { display: 'flex', justifyContent: 'space-between' },
  stepWrapper: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },
  stepTop: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 12 },
  stepCircle: { width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 16, transition: 'all 0.3s', position: 'relative', zIndex: 2, flexShrink: 0 },
  stepLine: { position: 'absolute', top: '50%', left: '50%', right: '-50%', height: 2, transform: 'translateY(-50%)', zIndex: 1 },
  stepLabel: { fontSize: 13, textAlign: 'center', padding: '0 4px', lineHeight: 1.3 },
  infoBox: { background: 'transparent', textAlign: 'center', margin: '0 0 28px', padding: '0 20px' },
  infoText: { fontFamily: "'Fraunces', sans-serif", fontSize: 20, color: 'var(--dark-red)', fontWeight: 600 },
  detailCard: { background: '#e8e0d4', borderRadius: 16, padding: 24, transition: 'all 0.3s ease' },
  receiptCard: { border: '2px dashed #cba884', background: '#fdfbf7', boxShadow: '0 8px 30px rgba(122, 16, 16, 0.1)', padding: 36, maxWidth: 450, margin: '0 auto' },
  detailRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 },
};
