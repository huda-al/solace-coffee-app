import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Clock, Users, DollarSign, LogOut, User, Inbox, Coffee, TrendingUp, Copy, MapPin, Calendar, Plus, Edit3, X, Phone, MessageCircle } from 'lucide-react';
import dashboardLogo from '../assets/dashboard.png';
const STATUS_OPTIONS = [
  { val: 'Menunggu Konfirmasi', label: 'Pending' },
  { val: 'Pesanan Dibuat', label: 'Diproses' },
  { val: 'Pesanan Sedang Dikirim', label: 'Dikirim' },
  { val: 'Pesanan Telah Selesai', label: 'Selesai' },
  { val: 'Dibatalkan', label: 'Batal' }
];

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  toast.success('Alamat disalin ke clipboard!');
};

const getWaLink = (phone, orderId, name) => {
  if (!phone) return '#';
  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.substring(1);
  const msg = `Halo kak ${name}, ini dari kurir Solace Coffee. Saya sedang membawa pesanan kakak dengan ID ${orderId.substring(0,8).toUpperCase()}. Mohon konfirmasi patokan alamatnya ya kak...`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
};

function Sidebar({ active }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = [
    { key: 'dashboard', label: 'DASHBOARD', path: '/admin' },
    { key: 'produk', label: 'PRODUK', path: '/admin/produk' },
    { key: 'pesanan', label: 'PESANAN', path: '/admin/pesanan' },
  ];
  return (
    <div className="admin-sidebar" style={s.sidebar}>
      <div style={s.sidebarLogo}>
        <img src={dashboardLogo} alt="Dashboard Logo" style={{ height: 50, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} />
      </div>
      <nav style={s.sidebarNav}>
        {items.map(item => (
          <Link key={item.key} to={item.path} style={{ ...s.sidebarLink, ...(active === item.key ? s.sidebarLinkActive : {}) }}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={s.sidebarUser}>
        <div style={s.userAvatar}><User size={20} /></div>
        <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>{user?.nama?.toUpperCase()}</span>
        <button style={s.logoutBtn} onClick={() => { logout(); navigate('/'); }}><LogOut size={18} /></button>
      </div>
    </div>
  );
}

function ProdukManager() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMenus = async () => {
    try {
      const res = await axios.get('/api/menu/all');
      setMenus(res.data);
    } catch {
      toast.error('Gagal memuat menu');
    } finally {
      setLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [formData, setFormData] = useState({ nama_menu: '', deskripsi: '', harga: '', kategori: 'Coffee Base', stok: 0, tersedia: true });
  const [gambarFile, setGambarFile] = useState(null);

  useEffect(() => { loadMenus(); }, []);

  const openAdd = () => {
    setEditingMenu(null);
    setFormData({ nama_menu: '', deskripsi: '', harga: '', kategori: 'Coffee Base', stok: 0, tersedia: true });
    setGambarFile(null);
    setShowModal(true);
  };

  const openEdit = (menu) => {
    setEditingMenu(menu);
    setFormData({ nama_menu: menu.nama_menu, deskripsi: menu.deskripsi || '', harga: menu.harga, kategori: menu.kategori, stok: menu.stok, tersedia: menu.tersedia });
    setGambarFile(null);
    setShowModal(true);
  };

  const saveMenu = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('nama_menu', formData.nama_menu);
    data.append('deskripsi', formData.deskripsi);
    data.append('harga', formData.harga);
    data.append('kategori', formData.kategori);
    data.append('stok', formData.stok);
    data.append('tersedia', formData.tersedia);
    if (gambarFile) data.append('gambar', gambarFile);

    try {
      if (editingMenu) {
        await axios.put(`/api/menu/${editingMenu._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success('Produk berhasil diperbarui');
      } else {
        await axios.post('/api/menu', data, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success('Produk berhasil ditambahkan');
      }
      setShowModal(false);
      loadMenus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk');
    }
  };

  const updateStok = async (id, newStok) => {
    try {
      await axios.put(`/api/menu/${id}`, { stok: newStok });
      toast.success('Stok berhasil diupdate');
      loadMenus();
    } catch {
      toast.error('Gagal update stok');
    }
  };

  if (loading) return <div className="loading">Memuat produk...</div>;

  const groupedMenus = menus.reduce((acc, m) => {
    if (!acc[m.kategori]) acc[m.kategori] = [];
    acc[m.kategori].push(m);
    return acc;
  }, {});

  return (
    <div style={s.tableCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <h2 style={{ ...s.tableTitle, display: 'flex', alignItems: 'center', gap: 12 }}><Package size={24} /> Manajemen Produk</h2>
        <button onClick={openAdd} className="btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}><Plus size={16} /> Tambah Produk</button>
      </div>
      
      {Object.entries(groupedMenus).map(([kategori, items]) => (
        <div key={kategori} style={{ marginBottom: 32 }}>
          <h3 style={{ fontFamily: "'Fraunces', sans-serif", fontSize: 18, color: 'var(--dark-red)', paddingBottom: 8, borderBottom: '2px solid var(--light-tan)', marginBottom: 16 }}>{kategori}</h3>
          <table style={s.table}>
            <thead>
              <tr style={s.tableHead}>
                <th style={s.th}>Produk</th>
                <th style={s.th}>Harga</th>
                <th style={s.th}>Stok</th>
                <th style={s.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m._id} style={s.tr}>
                  <td style={s.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {m.gambar && <img src={m.gambar} alt={m.nama_menu} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
                      <span style={{ fontWeight: 600 }}>{m.nama_menu}</span>
                    </div>
                  </td>
                  <td style={s.td}>Rp {m.harga.toLocaleString('id-ID')}</td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button onClick={() => updateStok(m._id, Math.max(0, m.stok - 1))} style={s.qtyBtn}>-</button>
                      <input 
                        type="number"
                        min="0"
                        key={m.stok}
                        defaultValue={m.stok}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 0 && val !== m.stok) updateStok(m._id, val);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.target.blur();
                        }}
                        style={{ fontWeight: 'bold', width: 44, textAlign: 'center', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 0', outline: 'none' }} 
                      />
                      <button onClick={() => updateStok(m._id, m.stok + 1)} style={s.qtyBtn}>+</button>
                    </div>
                  </td>
                  <td style={s.td}>
                    <button onClick={() => openEdit(m)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--dark-red)' }} title="Edit Produk">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Modal Tambah/Edit Produk */}
      {showModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.modalContent, maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Fraunces', sans-serif", color: 'var(--dark-red)', fontSize: 20 }}>
                {editingMenu ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={saveMenu} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Nama Produk</label>
                <input type="text" className="input-field" value={formData.nama_menu} onChange={(e) => setFormData({...formData, nama_menu: e.target.value})} required placeholder="Contoh: Caramel Macchiato" />
              </div>
              
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Kategori</label>
                  <select className="input-field" value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} required>
                    <option value="Classic">Classic</option>
                    <option value="Coffee Base">Coffee Base</option>
                    <option value="Non Coffee">Non Coffee</option>
                    <option value="Tea Series">Tea Series</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Harga (Rp)</label>
                  <input type="number" min="0" className="input-field" value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})} required placeholder="25000" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Deskripsi (Opsional)</label>
                <textarea className="input-field" value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} placeholder="Penjelasan singkat mengenai produk ini..." rows="3" style={{ resize: 'vertical' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Stok Awal</label>
                  <input type="number" min="0" className="input-field" value={formData.stok} onChange={(e) => setFormData({...formData, stok: e.target.value})} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Status Tersedia</label>
                  <select className="input-field" value={formData.tersedia} onChange={(e) => setFormData({...formData, tersedia: e.target.value === 'true'})}>
                    <option value="true">Tersedia (Aktif)</option>
                    <option value="false">Tidak Tersedia</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Foto Produk {editingMenu && '(Kosongkan jika tidak ingin mengubah)'}</label>
                <input type="file" accept="image/*" onChange={(e) => setGambarFile(e.target.files[0])} className="input-field" style={{ padding: '10px' }} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-outline" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>Batal</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}>Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderManager({ orders, updateStatus, loadData }) {
  const [editingOrder, setEditingOrder] = useState(null);

  const saveEdit = async () => {
    try {
      const total = editingOrder.detail_pesanan.reduce((sum, item) => sum + item.subtotal, 0);
      await axios.put(`/api/admin/orders/${editingOrder._id}`, {
        detail_pesanan: editingOrder.detail_pesanan,
        total_harga: total
      });
      toast.success('Pesanan diperbarui');
      setEditingOrder(null);
      loadData();
    } catch { toast.error('Gagal update pesanan'); }
  };

  const updateQty = (idx, newQty) => {
    if (newQty < 0) return;
    const newDetails = [...editingOrder.detail_pesanan];
    if (newQty === 0) {
      newDetails.splice(idx, 1);
    } else {
      newDetails[idx].jumlah = newQty;
      newDetails[idx].subtotal = newDetails[idx].harga * newQty;
    }
    setEditingOrder({ ...editingOrder, detail_pesanan: newDetails });
  };

  const groupedOrders = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    let group = acc.find(g => g.date === date);
    if (!group) {
      group = { date, items: [] };
      acc.push(group);
    }
    group.items.push(order);
    return acc;
  }, []);

  return (
    <div style={s.tableCard}>
      <h2 style={{ ...s.tableTitle, display: 'flex', alignItems: 'center', gap: 12 }}><Inbox size={24} /> Manajemen Pesanan</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={s.table}>
          <thead>
            <tr style={s.tableHead}>
              <th style={s.th}>ID / Jam</th>
              <th style={s.th}>Pelanggan</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {groupedOrders.map((group, gIdx) => (
              <React.Fragment key={gIdx}>
                <tr>
                  <td colSpan="5" style={{ background: 'var(--light-tan)', color: 'var(--dark-red)', fontWeight: 'bold', padding: '10px 16px', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={16} /> {group.date}
                    </div>
                  </td>
                </tr>
                {group.items.map(order => (
                  <tr key={order._id} style={s.tr}>
                    <td style={{...s.td, fontSize: 12}}>
                      <div style={{ fontWeight: 600 }}>{order._id.substring(0,8).toUpperCase()}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td style={s.td}>
                  <div style={{ fontWeight: 600 }}>{order.id_pelanggan?.nama || '-'}</div>
                  {order.id_pelanggan?.nomor_telepon && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, width: '100%' }}>{order.id_pelanggan.nomor_telepon}</span>
                      <a href={`tel:${order.id_pelanggan.nomor_telepon}`} style={{ background: 'var(--light-tan)', border: '1px solid var(--dark-red)', borderRadius: 6, padding: '6px 12px', color: 'var(--dark-red)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }} title="Telepon">
                        <Phone size={14} /> Call
                      </a>
                      <a href={getWaLink(order.id_pelanggan.nomor_telepon, order._id, order.id_pelanggan.nama)} target="_blank" rel="noreferrer" style={{ background: '#E8F9F0', border: '1px solid #25D366', borderRadius: 6, padding: '6px 12px', color: '#128C7E', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }} title="WhatsApp">
                        <MessageCircle size={14} /> WA
                      </a>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-dark)', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word', width: '100%' }}>
                      {order.alamat_pengiriman}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button onClick={() => copyToClipboard(order.alamat_pengiriman)} style={{ background: '#f5f5f5', border: '1px solid #ccc', borderRadius: 6, cursor: 'pointer', color: 'var(--text-dark)', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600 }} title="Copy Alamat">
                        <Copy size={14} /> Salin
                      </button>
                      {order.titik_lokasi && order.titik_lokasi.lat && (
                        <a href={`https://www.google.com/maps/search/?api=1&query=${order.titik_lokasi.lat},${order.titik_lokasi.lng}`} target="_blank" rel="noreferrer" style={{ background: '#e3f2fd', border: '1px solid #1a73e8', borderRadius: 6, cursor: 'pointer', color: '#1a73e8', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }} title="Buka di Maps">
                          <MapPin size={14} /> Maps
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td style={s.td}>Rp {order.total_harga.toLocaleString('id-ID')}</td>
                <td style={s.td}>
                  {(() => {
                    const isDone = order.status_pesanan === 'Pesanan Telah Selesai' || order.status_pesanan === 'Dibatalkan';
                    return (
                      <select 
                        value={order.status_pesanan}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        disabled={isDone}
                        style={{
                          ...s.select,
                          background: isDone ? 'var(--light-tan)' : 'white',
                          color: isDone ? 'var(--text-muted)' : 'var(--dark-red)',
                          fontWeight: 600,
                          cursor: isDone ? 'not-allowed' : 'pointer',
                          opacity: isDone ? 0.7 : 1,
                          border: '1px solid ' + (isDone ? 'var(--border)' : 'var(--dark-red)'),
                          outline: 'none',
                          padding: '8px 12px'
                        }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.val} value={opt.val}>{opt.label}</option>
                        ))}
                      </select>
                    );
                  })()}
                </td>
                <td style={s.td}>
                  <button 
                    disabled={order.status_pesanan === 'Pesanan Telah Selesai' || order.status_pesanan === 'Dibatalkan'} 
                    onClick={() => setEditingOrder(JSON.parse(JSON.stringify(order)))} 
                    style={{
                      ...s.btnEdit, 
                      padding: '4px 8px',
                      fontSize: 10,
                      opacity: (order.status_pesanan === 'Pesanan Telah Selesai' || order.status_pesanan === 'Dibatalkan') ? 0.5 : 1, 
                      cursor: (order.status_pesanan === 'Pesanan Telah Selesai' || order.status_pesanan === 'Dibatalkan') ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Edit Item
                  </button>
                </td>
              </tr>
            ))}
            </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingOrder && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <h3 style={{...s.tableTitle, marginBottom: 16}}>Edit Pesanan: {editingOrder._id.substring(0,8).toUpperCase()}</h3>
            <div style={{maxHeight: 400, overflowY: 'auto', marginBottom: 20, paddingRight: 10}}>
              {editingOrder.detail_pesanan.length === 0 ? (
                <p style={{textAlign: 'center', color: 'var(--text-muted)'}}>Pesanan kosong.</p>
              ) : (
                editingOrder.detail_pesanan.map((item, idx) => (
                  <div key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)'}}>
                    <div>
                      <p style={{fontWeight: 700, fontSize: 14, margin: 0, color: 'var(--dark-red)'}}>{item.nama_menu}</p>
                      <p style={{fontSize: 12, color: 'var(--text-muted)', margin: 0}}>Rp {item.harga.toLocaleString('id-ID')}</p>
                    </div>
                    <div style={{display: 'flex', gap: 12, alignItems: 'center'}}>
                      <button onClick={() => updateQty(idx, item.jumlah - 1)} style={s.qtyBtn}>-</button>
                      <span style={{fontWeight: 'bold', width: 24, textAlign: 'center', fontSize: 16}}>{item.jumlah}</span>
                      <button onClick={() => updateQty(idx, item.jumlah + 1)} style={s.qtyBtn}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 24, padding: '16px 0', borderTop: '2px dashed var(--border)'}}>
              <span>Total Baru:</span>
              <span style={{color: 'var(--dark-red)'}}>Rp {editingOrder.detail_pesanan.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString('id-ID')}</span>
            </div>
            <div style={{display: 'flex', gap: 12}}>
              <button onClick={() => setEditingOrder(null)} style={s.btnDecline}>Batal</button>
              <button onClick={saveEdit} style={s.btnAccept}>Simpan Perubahan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevOrdersRef = useRef([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const view = location.pathname.includes('/produk') ? 'produk' 
             : location.pathname.includes('/pesanan') ? 'pesanan' 
             : 'dashboard';

  const loadData = useCallback(async (isPolling = false) => {
    try {
      const [dashRes, ordersRes] = await Promise.all([
        axios.get('/api/admin/dashboard'),
        axios.get('/api/admin/orders')
      ]);
      setStats(dashRes.data);
      
      const newOrdersData = ordersRes.data;
      
      if (isPolling === true && prevOrdersRef.current.length > 0) {
        const prevPendingIds = new Set(prevOrdersRef.current.filter(o => o.status_pesanan === 'Menunggu Konfirmasi').map(o => o._id));
        const newPending = newOrdersData.filter(o => o.status_pesanan === 'Menunggu Konfirmasi' && !prevPendingIds.has(o._id));
        
        if (newPending.length > 0) {
          toast.info(`🔔 Ada ${newPending.length} pesanan baru masuk!`, {
            position: "top-right",
            autoClose: 5000,
          });
          // Play notification sound
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            osc.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
            
            setTimeout(() => {
              const osc2 = ctx.createOscillator();
              osc2.connect(ctx.destination);
              osc2.frequency.setValueAtTime(1046.50, ctx.currentTime);
              osc2.start();
              osc2.stop(ctx.currentTime + 0.2);
            }, 150);
          } catch (e) {}
        }
      }
      
      prevOrdersRef.current = newOrdersData;
      setOrders(newOrdersData);
      
    } catch {
      if (isPolling !== true) toast.error('Gagal memuat data');
    } finally {
      if (isPolling !== true) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    loadData(false);
    
    // Auto-refresh data every 10 seconds to check for new orders
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [user, navigate, loadData]);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/admin/orders/${orderId}/status`, { status_pesanan: status });
      toast.success('Status diperbarui!');
      loadData();
    } catch {
      toast.error('Gagal update status');
    }
  };

  if (loading) return <div className="loading">Memuat dashboard...</div>;
  const incomingOrders = orders.filter(o => o.status_pesanan === 'Menunggu Konfirmasi');

  return (
    <div className="admin-layout" style={s.layout}>
      <Sidebar active={view} />
      <main className="admin-main" style={s.main}>
        {view === 'dashboard' && (
          <>
            <h1 style={s.welcome}>Welcome, {user?.nama}</h1>
            {stats && (
              <div style={s.statsGrid}>
                {[
                  { label: 'Total Pesanan', value: stats.totalPesanan, icon: <Package size={28} color="var(--dark-red)" /> },
                  { label: 'Pesanan Pending', value: stats.pesananPending, icon: <Clock size={28} color="var(--dark-red)" /> },
                  { label: 'Total Pelanggan', value: stats.totalPelanggan, icon: <Users size={28} color="var(--dark-red)" /> },
                  { label: 'Pendapatan', value: `Rp ${stats.totalPendapatan.toLocaleString('id-ID')}`, icon: <DollarSign size={28} color="var(--dark-red)" /> },
                ].map((stat, i) => (
                  <div key={i} style={s.statCard}>
                    <span style={s.statIcon}>{stat.icon}</span>
                    <div>
                      <p style={s.statLabel}>{stat.label}</p>
                      <p style={s.statValue}>{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {stats?.chartData && (
              <div style={{ ...s.tableCard, marginBottom: 32, padding: '24px 24px 12px' }}>
                <h2 style={{ ...s.tableTitle, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><TrendingUp size={28} /> Tren Pendapatan (7 Hari Terakhir)</h2>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={stats.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--dark-red)" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="var(--dark-red)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis 
                        stroke="var(--text-muted)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => value === 0 ? '0' : `Rp ${(value / 1000).toLocaleString('id-ID')}k`}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow)', background: 'var(--card-bg)' }}
                        formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                        labelStyle={{ color: 'var(--dark-red)', fontWeight: 'bold', marginBottom: 4 }}
                      />
                      <Area type="monotone" dataKey="pendapatan" stroke="var(--dark-red)" strokeWidth={3} fillOpacity={1} fill="url(#colorPendapatan)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            <div style={{ ...s.tableCard, marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <h2 style={{ ...s.tableTitle, display: 'flex', alignItems: 'center', gap: 10 }}><Inbox size={28} /> Pesanan Masuk (Pending)</h2>
                {incomingOrders.length > 0 && <span style={s.incomingBadge}>{incomingOrders.length} baru</span>}
              </div>
              {incomingOrders.length === 0 ? (
                <div style={s.emptyState}>
                  <span style={{ fontSize: 36, display: 'flex', color: 'var(--text-muted)' }}><Inbox size={48} /></span>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 12 }}>Tidak ada pesanan masuk saat ini</p>
                </div>
              ) : (
                <div style={s.incomingGrid}>
                  {incomingOrders.map(order => (
                    <div 
                      key={order._id} 
                      style={{...s.incomingCard, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': {transform: 'translateY(-2px)'}}} 
                      onClick={() => navigate('/admin/pesanan')}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div>
                          <div style={s.incomingName}>{order.id_pelanggan?.nama || 'Pelanggan'}</div>
                          {order.id_pelanggan?.nomor_telepon && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                              <a href={`tel:${order.id_pelanggan.nomor_telepon}`} onClick={(e) => e.stopPropagation()} style={{ background: 'var(--light-tan)', border: '1px solid var(--dark-red)', borderRadius: 6, padding: '8px 12px', color: 'var(--dark-red)', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                                <Phone size={14} /> Call
                              </a>
                              <a href={getWaLink(order.id_pelanggan.nomor_telepon, order._id, order.id_pelanggan.nama)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ background: '#E8F9F0', border: '1px solid #25D366', borderRadius: 6, padding: '8px 12px', color: '#128C7E', display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
                                <MessageCircle size={14} /> WhatsApp
                              </a>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={(e) => { e.stopPropagation(); copyToClipboard(order.alamat_pengiriman); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: '1px solid var(--dark-red)', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', color: 'var(--dark-red)', fontWeight: 600 }}>
                              <Copy size={10} /> Copy
                            </button>
                            {order.titik_lokasi && order.titik_lokasi.lat && (
                              <a href={`https://www.google.com/maps/search/?api=1&query=${order.titik_lokasi.lat},${order.titik_lokasi.lng}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, background: 'var(--light-tan)', border: '1px solid var(--dark-red)', borderRadius: 4, padding: '2px 6px', fontSize: 10, cursor: 'pointer', color: 'var(--dark-red)', fontWeight: 600 }}>
                                <MapPin size={10} /> Maps
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <p style={s.incomingOrderLabel}>Order :</p>
                      <div style={{ marginBottom: 8 }}>
                        {order.detail_pesanan.map((item, idx) => (
                          <div key={idx} style={s.incomingItemRow}>
                            <span>{item.nama_menu} × {item.jumlah}</span>
                            <span style={{ fontWeight: 600 }}>{item.subtotal.toLocaleString('id-ID')}</span>
                          </div>
                        ))}
                      </div>
                      <div style={s.incomingDivider} />
                      <div style={{ ...s.incomingItemRow, fontWeight: 700, marginBottom: 4 }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--dark-red)' }}>{order.total_harga.toLocaleString('id-ID')}</span>
                      </div>
                      <div style={s.incomingDivider} />
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button style={s.btnAccept} onClick={(e) => { e.stopPropagation(); updateStatus(order._id, 'Pesanan Dibuat'); navigate('/admin/pesanan'); }}>Accept</button>
                        <button style={s.btnDecline} onClick={(e) => { e.stopPropagation(); updateStatus(order._id, 'Dibatalkan'); }}>Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'produk' && <ProdukManager />}
        
        {view === 'pesanan' && <OrderManager orders={orders} updateStatus={updateStatus} loadData={loadData} />}
      </main>
    </div>
  );
}

const s = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' },
  sidebar: { width: 220, background: 'var(--dark-red)', display: 'flex', flexDirection: 'column', padding: '24px 0' },
  sidebarLogo: { padding: '8px 24px 32px' },
  sidebarLogoText: { fontFamily: "'Fraunces', sans-serif", fontSize: 28, color: 'white', fontWeight: 700 },
  sidebarNav: { flex: 1, display: 'flex', flexDirection: 'column' },
  sidebarLink: { padding: '12px 24px', color: 'rgba(255,255,255,0.75)', textDecoration: 'none', fontSize: 13, fontWeight: 600, letterSpacing: 1, transition: 'all 0.2s' },
  sidebarLinkActive: { color: 'white', borderLeft: '3px solid white', background: 'rgba(255,255,255,0.1)' },
  sidebarUser: { padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid rgba(255,255,255,0.2)' },
  userAvatar: { width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  logoutBtn: { marginLeft: 'auto', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 18, cursor: 'pointer' },
  main: { flex: 1, padding: 32, overflow: 'auto' },
  welcome: { fontFamily: "'Fraunces', sans-serif", fontSize: 32, color: 'var(--dark-red)', marginBottom: 28 },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  statCard: { background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 },
  statIcon: { fontSize: 32 },
  statLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 },
  statValue: { fontFamily: "'Fraunces', sans-serif", fontSize: 22, color: 'var(--dark-red)', fontWeight: 700 },
  incomingBadge: { background: 'var(--dark-red)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 0' },
  incomingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  incomingCard: { background: 'var(--card-bg)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '16px 18px', boxShadow: '0 2px 10px rgba(122,16,16,0.07)', display: 'flex', flexDirection: 'column' },
  incomingName: { fontFamily: "'Fraunces', sans-serif", fontSize: 16, color: 'var(--dark-red)', fontWeight: 700 },
  incomingOrderLabel: { fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 },
  incomingItemRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3, color: 'var(--text-dark)' },
  incomingDivider: { borderTop: '1px solid var(--border)', margin: '8px 0' },
  btnAccept: { flex: 1, padding: '9px 0', background: 'var(--dark-red)', color: 'white', border: 'none', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' },
  btnDecline: { flex: 1, padding: '9px 0', background: 'transparent', color: 'var(--dark-red)', border: '1.5px solid var(--dark-red)', borderRadius: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' },
  tableCard: { background: 'var(--card-bg)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', borderRadius: 16, padding: 24 },
  tableTitle: { fontFamily: "'Fraunces', sans-serif", fontSize: 22, color: 'var(--dark-red)', marginBottom: 20 },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHead: { borderBottom: '1px solid var(--border)' },
  th: { padding: '10px 12px', textAlign: 'left', fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, letterSpacing: 0.5 },
  tr: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 12px', fontSize: 13, verticalAlign: 'middle' },
  select: { padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', fontSize: 12, cursor: 'pointer', color: 'var(--text-dark)' },
  qtyBtn: { width: 32, height: 32, borderRadius: 8, background: '#eee', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
  btnEdit: { background: 'var(--light-tan)', border: '1px solid var(--dark-red)', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: 'var(--dark-red)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: 32, borderRadius: 16, width: '100%', maxWidth: 450, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
};
