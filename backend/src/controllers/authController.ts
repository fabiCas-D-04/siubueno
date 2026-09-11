import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../database/connection';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: 'Usuario y contrasena son requeridos' });
      return;
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      res.status(401).json({ message: 'Usuario o contrasena incorrectos' });
      return;
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ message: 'Usuario o contrasena incorrectos' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    let studentInfo = null;
    if (user.role === 'student') {
      const studentResult = await pool.query(
        `SELECT s.*, c.name as career_name, c.code as career_code
         FROM students s JOIN careers c ON s.career_id = c.id
         WHERE s.user_id = $1`,
        [user.id]
      );
      if (studentResult.rows.length > 0) {
        studentInfo = studentResult.rows[0];
      }
    }

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      student: studentInfo,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [req.user.userId]);
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    let studentInfo = null;
    if (result.rows[0].role === 'student') {
      const studentResult = await pool.query(
        `SELECT s.*, c.name as career_name, c.code as career_code
         FROM students s JOIN careers c ON s.career_id = c.id
         WHERE s.user_id = $1`,
        [req.user.userId]
      );
      if (studentResult.rows.length > 0) {
        studentInfo = studentResult.rows[0];
      }
    }

    res.json({
      user: result.rows[0],
      student: studentInfo,
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ message: 'Sesion cerrada exitosamente' });
}
