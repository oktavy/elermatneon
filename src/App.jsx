import React, { useState } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newRole, setNewRole] = useState('guru');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('Memproses...');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setMessage('');
      } else {
        setMessage(data.message || 'Login gagal');
      }
    } catch (err) {
      setMessage('Gagal terhubung ke server');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword, nama: newNama, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        alert('Akun berhasil ditambahkan ke Neon Database!');
        setNewUsername('');
        setNewPassword('');
        setNewNama('');
      } else {
        alert('Gagal menambah akun: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi');
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '80px auto', fontFamily: 'sans-serif', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Login E-Learning</h2>
        {message && <p style={{ color: 'red' }}>{message}</p>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '10px' }}>
            <label>Username:</label><br/>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password:</label><br/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
        <h1>Dashboard E-Learning</h1>
        <div>
          <span>Halo, <b>{user.nama}</b> ({user.role})</span>
          <button onClick={() => setUser(null)} style={{ marginLeft: '10px', padding: '5px 10px' }}>Logout</button>
        </div>
      </header>

      {user.role === 'admin' && (
        <section style={{ marginTop: '20px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3>Panel Admin: Tambah Akun Baru (Guru / Siswa)</h3>
          <form onSubmit={handleCreateUser}>
            <div style={{ marginBottom: '10px' }}>
              <label>Nama Lengkap:</label><br/>
              <input type="text" value={newNama} onChange={e => setNewNama(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Username:</label><br/>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Password:</label><br/>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }}/>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Role:</label><br/>
              <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ width: '100%', padding: '8px' }}>
                <option value="guru">Guru</option>
                <option value="siswa">Siswa</option>
              </select>
            </div>
            <button type="submit" style={{ padding: '10px 20px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px' }}>Simpan ke Neon Database</button>
          </form>
        </section>
      )}

      {user.role !== 'admin' && (
        <div style={{ marginTop: '20px' }}>
          <p>Selamat datang di portal {user.role}. Data Anda tersimpan secara sinkron di cloud database Neon.</p>
        </div>
      )}
    </div>
  );
}
