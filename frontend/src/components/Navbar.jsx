import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, X } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const renderCartBtn = (className) => (
    <button
      className={`cart-btn ${className}`}
      onClick={() => { navigate('/checkout'); closeMenu(); }}
      style={{
        border: isActive('/checkout') ? '2px solid var(--dark-red)' : '2px solid transparent',
        padding: '6px 12px',
        borderRadius: 50,
        color: 'var(--dark-red)',
        transition: 'all 0.3s ease'
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--dark-red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
      {totalItems > 0 && <span className="cart-badge" style={{ top: -2, right: 0 }}>{totalItems}</span>}
    </button>
  );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <img src={logoImg} alt="Solace Logo" style={{ height: 40, width: 'auto' }} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {renderCartBtn('mobile-cart')}

          <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Menu">
            <div className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        <ul className={`navbar-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <li>
            <Link
              to="/menu"
              onClick={(e) => {
                if (location.pathname === '/menu') {
                  e.preventDefault();
                  document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                closeMenu();
              }}
              style={{
                color: 'var(--dark-red)',
                border: isActive('/menu') || location.pathname === '/' ? '2px solid var(--dark-red)' : '2px solid transparent',
                padding: '6px 16px',
                borderRadius: 50,
                transition: 'all 0.3s ease',
                textDecoration: 'none'
              }}
            >
              Menu
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              onClick={closeMenu}
              style={{
                color: 'var(--dark-red)',
                border: isActive('/about') ? '2px solid var(--dark-red)' : '2px solid transparent',
                padding: '6px 16px',
                borderRadius: 50,
                transition: 'all 0.3s ease'
              }}
            >
              About us
            </Link>
          </li>
          {user ? (
            <>
              <li>
                <span style={{ color: 'var(--dark-red)', fontWeight: 600 }}>
                  {user.nama}
                </span>
              </li>
              {user.role === 'admin' && (
                <li><Link to="/admin" onClick={closeMenu}>Dashboard</Link></li>
              )}
              <li>
                <button className="btn-primary" style={{ padding: '8px 18px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => { logout(); navigate('/'); }}>
                  Logout
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" style={{ textDecoration: 'none' }} onClick={closeMenu}>
                <button className="btn-primary" style={{ padding: '8px 20px', borderRadius: 50, display: 'flex', alignItems: 'center', gap: 8 }}>
                  Login
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </button>
              </Link>
            </li>
          )}

          <li className="desktop-cart">
            {renderCartBtn('')}
          </li>
        </ul>
      </div>
    </nav>
  );
}
