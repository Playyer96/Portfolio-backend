import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';
import { connectToDb } from '../config/db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const db = await connectToDb();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ id: user._id, email: user.email, role: user.role });
    res.json({ token, user: { email: user.email, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const db = await connectToDb();
    const user = await db.collection('users').findOne(
      { email: req.user.email },
      { projection: { passwordHash: 0 } }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', requireAuth, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password required' });
    }

    const db = await connectToDb();
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.collection('users').insertOne({
      username, email, passwordHash, role: 'admin', createdAt: new Date(),
    });

    const token = generateToken({ id: result.insertedId, email, role: 'admin' });
    res.status(201).json({ token, user: { email, username, role: 'admin' } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  // Always return the same response to not reveal whether an email exists
  const GENERIC_OK = { message: 'If that email is registered, a reset link has been sent.' };

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const db = await connectToDb();
    const user = await db.collection('users').findOne({ email });
    if (!user) return res.json(GENERIC_OK);

    const plainToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.collection('users').updateOne(
      { email },
      { $set: { resetTokenHash: tokenHash, resetTokenExpiry: expiry } }
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${plainToken}`;

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@danilovanegas.xyz',
      to: email,
      subject: 'Reset your portfolio dashboard password',
      html: `
        <p>You requested a password reset for your portfolio dashboard.</p>
        <p><a href="${resetLink}">Click here to reset your password</a></p>
        <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        <p style="color:#999;font-size:12px">${resetLink}</p>
      `,
    });

    res.json(GENERIC_OK);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and new password required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const db = await connectToDb();
    const user = await db.collection('users').findOne({
      resetTokenHash: tokenHash,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: { passwordHash },
        $unset: { resetTokenHash: '', resetTokenExpiry: '' },
      }
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
