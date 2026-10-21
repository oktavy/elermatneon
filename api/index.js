const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.ELERMATH_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Inisialisasi Tabel Otomatis saat aplikasi berjalan
const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
  } catch (err) {
    console.error('Gagal inisialisasi tabel:', err);
  }
};
initDb();

// Endpoint tes koneksi
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', serverTime: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk mengambil daftar pengguna
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk menambah pengguna baru
app.post('/api/users', async (req, res) => {
  const { username, role } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (username, role) VALUES ($1, $2) RETURNING *',
      [username, role || 'Siswa']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
