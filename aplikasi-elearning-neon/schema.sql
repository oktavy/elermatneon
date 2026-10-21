-- Hapus tabel lama jika ada
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS lkpd_questions CASCADE;
DROP TABLE IF EXISTS lkpd CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Tabel Users (Admin, Guru, Siswa)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'guru', 'siswa')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel LKPD / Soal
CREATE TABLE lkpd (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    created_by INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lkpd_questions (
    id SERIAL PRIMARY KEY,
    lkpd_id INT REFERENCES lkpd(id) ON DELETE CASCADE,
    pertanyaan TEXT NOT NULL,
    urutan INT DEFAULT 1
);

-- 3. Tabel Jawaban Siswa
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    lkpd_id INT REFERENCES lkpd(id) ON DELETE CASCADE,
    student_id INT REFERENCES users(id) ON DELETE CASCADE,
    jawaban JSONB NOT NULL,
    nilai INT DEFAULT NULL,
    catatan_guru TEXT DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AKUN DEFAULT (ADMIN):
-- Username: admin
-- Password: adminpassword
INSERT INTO users (username, password, nama, role) 
VALUES ('admin', '$2a$10$wT8K8Uj2T4g5L.pQ3zJm0.3jN4qF7m5R0r/9o0hJ.7d7K7a7b7c7d', 'Administrator Utama', 'admin');
