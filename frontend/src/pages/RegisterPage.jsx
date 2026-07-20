import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import backgroundImg from '../assets/background.png';
import loginLogo from '../assets/login.png';

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: '', email: '', password: '', confirmPassword: '', nomor_telepon: '', alamat_pengiriman: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Password tidak cocok!');
    setLoading(true);
    try {
      await register({ nama: form.nama, email: form.email, password: form.password, nomor_telepon: form.nomor_telepon, alamat_pengiriman: form.alamat_pengiriman });
      toast.success('Akun berhasil dibuat!');
      navigate('/menu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'nama', placeholder: 'Nama Lengkap', type: 'text' },
    { key: 'email', placeholder: 'Email', type: 'email' },
    { key: 'nomor_telepon', placeholder: 'Nomor WhatsApp (cth: 0812xxxx)', type: 'text' },
    { key: 'alamat_pengiriman', placeholder: 'Alamat Pengiriman', type: 'text' },
    { key: 'password', placeholder: 'Password', type: 'password' },
    { key: 'confirmPassword', placeholder: 'Confirm Password', type: 'password' },
  ];

  return (
    <div style={styles.page}>
      <div className="auth-left-panel" style={styles.leftPanel}>
        <div style={{ marginBottom: 24 }}>
          <img src={loginLogo} alt="Solace Coffee" style={{ width: '100%', height: 'auto' }} />
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {fields.map(f => (
            <input
              key={f.key}
              style={{ ...styles.pillInput, marginBottom: 14 }}
              placeholder={f.placeholder}
              type={f.type}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              required={f.key !== 'nomor_telepon' && f.key !== 'alamat_pengiriman'}
            />
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button className="btn-primary" style={{ padding: '12px 48px', borderRadius: 50, fontSize: 16 }} type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <Link to="/login" style={styles.switchLink}>Login / Register</Link>
      </div>

      <div className="auth-right-panel" style={styles.rightPanel} />
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh' },
  leftPanel: { width: '36%', background: 'var(--tan-bg)', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24, boxShadow: '15px 0 40px rgba(0,0,0,0.5)', zIndex: 10 },
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
  form: { display: 'flex', flexDirection: 'column' },
  switchLink: { color: 'var(--dark-red)', fontWeight: 600, textDecoration: 'none', textAlign: 'center', fontSize: 14 },
  rightPanel: { 
    flex: 1, 
    backgroundImage: `url(${backgroundImg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative' 
  },
};
