const pool = require('./db');
const bcrypt = require('bcryptjs');

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      const result = await pool.query('SELECT id, username, nama, role, created_at FROM users ORDER BY id ASC');
      return res.status(200).json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { username, password, nama, role } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users (username, password, nama, role) VALUES ($1, $2, $3, $4) RETURNING id, username, nama, role',
        [username, hashedPassword, nama, role]
      );
      return res.status(201).json({ success: true, user: result.rows[0] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
};
