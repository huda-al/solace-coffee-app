import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import backgroundImg from '../assets/background.png';
import loginLogo from '../assets/login.png';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Selamat datang, ${user.nama}!`);
      navigate(user.role === 'admin' ? '/admin' : '/menu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Left panel */}
      <div className="auth-left-panel" style={styles.leftPanel}>
        <div style={{ marginBottom: 32 }}>
          <img src={loginLogo} alt="Solace Coffee" style={{ width: '100%', height: 'auto' }} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={{ ...styles.pillInput, marginBottom: 14 }}
            placeholder="Username / Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            style={{ ...styles.pillInput, marginBottom: 24 }}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn-primary" style={{ padding: '12px 48px', borderRadius: 50, fontSize: 16 }} type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </form>

        <Link to="/register" style={styles.switchLink}>Login / Register</Link>
      </div>

      {/* Right panel — cafe photo placeholder */}
      <div className="auth-right-panel" style={styles.rightPanel} />
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
  },
  leftPanel: {
    width: '36%',
    background: 'var(--tan-bg)',
    padding: '60px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 32,
    boxShadow: '15px 0 40px rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  pillInput: {
    width: '100%',
    padding: '14px 24px',
    background: 'rgba(255, 255, 255, 0.7)',
    border: 'none',
    borderRadius: 50,
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    color: 'var(--text-dark)',
    outline: 'none',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  switchLink: {
    color: 'var(--dark-red)',
    fontWeight: 600,
    textDecoration: 'none',
    textAlign: 'center',
    fontSize: 14,
  },
  rightPanel: {
    flex: 1,
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
  }
};
