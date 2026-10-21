const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Inisialisasi Koneksi Neon DB
const pool = new Pool({
  connectionString: process.env.ELERMATH_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Inisialisasi Tabel Otomatis
const initDb = async () => {
  try {
    // 1. Tabel Pengguna (Admin, Guru, Siswa)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Tabel Log Aktivitas Login
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Tabel Hasil Ujian/Pengerjaan Soal Siswa
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        student_username VARCHAR(100) NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Buat Akun Admin Default jika belum ada
    await pool.query(`
      INSERT INTO users (username, password, role)
      VALUES ('admin', 'admin123', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);

    console.log("Database & Tables initialized successfully.");
  } catch (err) {
    console.error("Gagal inisialisasi tabel:", err);
  }
};
initDb();

// --- ENDPOINT API ---

// 1. Endpoint Login (Menyimpan Log ke Neon DB)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userQuery = await pool.query(
      'SELECT * FROM users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    const user = userQuery.rows[0];

    // Simpan riwayat login ke tabel login_logs
    await pool.query(
      'INSERT INTO login_logs (username, role) VALUES ($1, $2)',
      [user.username, user.role]
    );

    res.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Endpoint Tambah Akun (Oleh Admin/Guru)
app.post('/api/users', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const newUser = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, password, role]
    );
    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Username sudah digunakan atau terjadi eror' });
  }
});

// 3. Endpoint Simpan Nilai/Pengerjaan Soal Siswa
app.post('/api/quiz/submit', async (req, res) => {
  const { studentUsername, score, totalQuestions } = req.body;
  try {
    const newResult = await pool.query(
      'INSERT INTO quiz_results (student_username, score, total_questions) VALUES ($1, $2, $3) RETURNING *',
      [studentUsername, score, totalQuestions]
    );
    res.status(201).json({ success: true, data: newResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Endpoint Ambil Log Login (Untuk Monitoring Admin)
app.get('/api/admin/logs', async (req, res) => {
  try {
    const logs = await pool.query('SELECT * FROM login_logs ORDER BY login_time DESC LIMIT 100');
    res.json(logs.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Endpoint Ambil Nilai Semua Siswa (Untuk Rekap Guru/Admin)
app.get('/api/quiz/results', async (req, res) => {
  try {
    const results = await pool.query('SELECT * FROM quiz_results ORDER BY submitted_at DESC');
    res.json(results.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
