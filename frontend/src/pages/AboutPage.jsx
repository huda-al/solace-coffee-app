import React from 'react';

const CoffeeBeanIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible', transform: 'rotate(25deg)' }}>
    <ellipse cx="12" cy="12" rx="7" ry="10" />
    <path d="M12 2 C 8 8 16 16 12 22" />
  </svg>
);

const MapPinIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LaptopIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
  </svg>
);

export default function AboutPage() {
  return (
    <div className="page-container fade-in" style={{ padding: '60px 24px', maxWidth: 900, margin: '0 auto', minHeight: '80vh' }}>
      <div className="fade-in" style={{ textAlign: 'center', marginBottom: 48, animationDelay: '0.1s', opacity: 0 }}>
        <h1 style={{ fontFamily: "'Fraunces', sans-serif", fontSize: 48, color: 'var(--dark-red)', marginBottom: 16 }}>Tentang Solace</h1>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          Lebih dari sekadar tempat singgah, Solace adalah ruang nyaman di tengah hiruk-pikuk kota tempat ide-ide lahir bersama secangkir kopi terbaik.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 48 }}>
        <div className="fade-in" style={{ background: '#e8e0d4', padding: 32, borderRadius: 20, textAlign: 'center', border: '1px solid var(--light-tan)', animationDelay: '0.2s', opacity: 0 }}>
          <div style={{ color: 'var(--dark-red)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <LaptopIcon size={48} />
          </div>
          <h3 style={{ fontFamily: "'Fraunces', sans-serif", fontSize: 24, color: 'var(--dark-red)', marginBottom: 12 }}>Nyaman Untuk Nugas</h3>
          <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.6 }}>
            Kami merancang setiap sudut Solace Coffee agar ideal bagi Anda yang butuh fokus bekerja, mengerjakan tugas kuliah, atau sekadar mencari inspirasi. Koneksi yang stabil dan suasana yang tenang siap menemani produktivitas Anda.
          </p>
        </div>

        <div className="fade-in" style={{ background: '#e8e0d4', padding: 32, borderRadius: 20, textAlign: 'center', border: '1px solid var(--light-tan)', animationDelay: '0.3s', opacity: 0 }}>
          <div style={{ color: 'var(--dark-red)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <CoffeeBeanIcon size={48} />
          </div>
          <h3 style={{ fontFamily: "'Fraunces', sans-serif", fontSize: 24, color: 'var(--dark-red)', marginBottom: 12 }}>Bagi Pecinta Kopi</h3>
          <p style={{ fontSize: 14, color: 'var(--text-dark)', lineHeight: 1.6 }}>
            Kopi kami diseduh dengan presisi dan gairah tinggi. Mulai dari biji kopi pilihan hingga teknik penyajian, Solace didedikasikan memuaskan selera sejati para pecinta kopi, menghadirkan rasa autentik di setiap tegukan.
          </p>
        </div>
      </div>

      <div className="fade-in" style={{ background: 'var(--dark-red)', borderRadius: 24, padding: 40, color: 'var(--light-tan)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', animationDelay: '0.4s', opacity: 0 }}>
        <div style={{ marginBottom: 16 }}>
          <MapPinIcon size={40} />
        </div>
        <h2 style={{ fontFamily: "'Fraunces', sans-serif", fontSize: 28, marginBottom: 12, color: 'var(--white)' }}>Temukan Kami</h2>
        <p style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 500, opacity: 0.9 }}>
          Jl. Teuku Nyak Arief No.612-614, Lamnyong, Lamgugob,<br/>Kec. Syiah Kuala, Kota Banda Aceh, Aceh 23115
        </p>
      </div>
    </div>
  );
}
