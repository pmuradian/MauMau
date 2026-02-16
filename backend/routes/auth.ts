import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';

const router = express.Router();

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 30;
const REFRESH_COOKIE_NAME = 'refreshToken';

function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'your-secret-key';
}

function generateAccessToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function setRefreshCookie(res: express.Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

async function saveRefreshToken(userId: string, rawToken: string): Promise<void> {
  await RefreshToken.create({
    tokenHash: hashToken(rawToken),
    userId,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
  });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user._id.toString(), refreshToken);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      message: 'User created successfully',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken();
    await saveRefreshToken(user._id.toString(), refreshToken);
    setRefreshCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!rawToken) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const tokenDoc = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
    if (!tokenDoc) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(tokenDoc.userId).select('-password');
    if (!user) {
      await tokenDoc.deleteOne();
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken(user._id.toString());

    res.json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME];
    if (rawToken) {
      await RefreshToken.deleteOne({ tokenHash: hashToken(rawToken) });
    }

    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/' });
    res.json({ message: 'Logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
