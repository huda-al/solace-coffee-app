import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import heroImg from '../assets/hero.png';
import dividerImg from '../assets/divider.png';
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

const CATEGORIES = ['Classic', 'Coffee Base', 'Non Coffee', 'Tea Series'];

const CoffeeIcon = () => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #eedcbe, #e1c59a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7a1010" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  </div>
);

// Custom hook: returns ref setter + whether element is visible
function useScrollReveal(threshold = 0.12) {
  const [ref, setRef] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, visible];
}

// Animated wrapper for sections / titles (fade up)
function Reveal({ children, delay = 0, style = {} }) {
  const [setRef, visible] = useScrollReveal();
  return (
    <div
      ref={setRef}
      style={{
        transition: `opacity 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(36px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Animated menu card with staggered delay
function CardReveal({ children, index, style = {} }) {
  const [setRef, visible] = useScrollReveal(0.08);
  const delay = (index % 4) * 0.09; // stagger max 4 columns
  return (
    <div
      ref={setRef}
      style={{
        transition: `opacity 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}s, transform 0.65s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.96)',
        height: '100%',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function MenuPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get('/api/menu')
      .then(res => {
        if (Array.isArray(res.data)) {
          setMenus(res.data);
        } else {
          console.error('API did not return an array:', res.data);
          toast.error('Gagal memuat menu: Server error');
        }
        setLoading(false);
      })
      .catch(() => { toast.error('Gagal memuat menu'); setLoading(false); });
  }, []);

  const grouped = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = menus.filter(m => m.kategori === cat);
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      {/* Hero */}
      <Reveal delay={0}>
        <div style={styles.hero}>
          <img src={heroImg} alt="Solace Coffee" className="hero-img" style={styles.heroImg} />
        </div>
      </Reveal>
      <div style={styles.dividerWrap} />

      <div id="menu-section" className="page-container" style={{ padding: '0 24px', maxWidth: 1200, margin: '0 auto', scrollMarginTop: '80px' }}>
        {CATEGORIES.map(cat => (
          grouped[cat].length > 0 && (
            <section key={cat} style={styles.section}>
              {/* Category title slides in */}
              <Reveal delay={0}>
                <h2 style={styles.categoryTitle}>{cat}</h2>
              </Reveal>

              <div className="menu-grid" style={styles.grid}>
                {grouped[cat].map((item, index) => (
                  <CardReveal key={item._id} index={index}>
                    <div
                      className="menu-card"
                      style={item.stok === 0 || !item.tersedia ? { opacity: 0.6, filter: 'grayscale(100%)', height: '100%' } : { height: '100%' }}
                    >
                      <div className="menu-img-wrap">
                        {(() => {
                          let imgSrc = item.gambar ? item.gambar : null;
                          const name = item.nama_menu.toLowerCase();
                          let objPos = undefined;
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

                          return imgSrc
                            ? <img src={imgSrc} alt={item.nama_menu} className="menu-img" style={{ ...(objPos ? { objectPosition: objPos } : {}) }} />
                            : <div className="menu-img"><CoffeeIcon /></div>;
                        })()}
                      </div>
                      <div style={styles.cardBody}>
                        <h3 style={styles.menuName}>{item.nama_menu}</h3>
                        {item.deskripsi && <p style={styles.menuDesc}>{item.deskripsi}</p>}
                        <p style={styles.menuPrice}>Rp {item.harga.toLocaleString('id-ID')}</p>
                        <button
                          className="menu-add-btn"
                          onClick={() => { addToCart(item); toast.success(`${item.nama_menu} ditambahkan ke keranjang!`); }}
                          disabled={!item.tersedia || item.stok === 0}
                        >
                          {item.stok === 0 ? 'Habis' : 'add'}
                        </button>
                      </div>
                    </div>
                  </CardReveal>
                ))}
              </div>
            </section>
          )
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { paddingBottom: 60 },
  hero: { textAlign: 'center', padding: '140px 24px 140px', display: 'flex', justifyContent: 'center' },
  heroImg: { maxWidth: '100%', width: 900, height: 'auto', objectFit: 'contain' },
  dividerWrap: { width: '100%', height: 32, margin: '20px 0 40px 0', backgroundImage: `url(${dividerImg})`, backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: 'center' },
  section: { marginTop: 48 },
  categoryTitle: { fontFamily: "'Fraunces', sans-serif", fontSize: 36, color: 'var(--dark-red)', marginBottom: 24, textAlign: 'left', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 },
  cardBody: { padding: '16px 8px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', flex: 1 },
  menuName: { fontFamily: "'Fraunces', sans-serif", fontSize: 22, color: 'var(--dark-red)', marginBottom: 6 },
  menuDesc: { fontSize: 13, color: 'var(--text-dark)', marginBottom: 8, lineHeight: 1.4 },
  menuPrice: { fontSize: 15, color: 'var(--dark-red)', fontWeight: 700, marginBottom: 12, marginTop: 'auto' },
};
