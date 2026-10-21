const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Koneksi ke Neon DB menggunakan variabel lingkungan
const pool = new Pool({
  connectionString: process.env.ELERMATH_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Otomatis Buat Tabel Pengguna saat Backend Dipanggil
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'Siswa',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tabel 'users' berhasil dibuat/diverifikasi di Neon DB.");
  } catch (err) {
    console.error("Gagal membuat tabel:", err);
  }
};
initDb();

// Endpoint Registrasi Akun Baru ke Neon DB
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
  }

  try {
    const newUser = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, password, role || 'Siswa']
    );
    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    if (err.code === '23505') { // Code unique constraint violation
      return res.status(400).json({ success: false, message: 'Username sudah terdaftar!' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// Endpoint Login Menggunakan Data Neon DB
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userQuery = await pool.query(
      'SELECT id, username, role FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah!' });
    }

    res.json({ success: true, user: userQuery.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = app;
