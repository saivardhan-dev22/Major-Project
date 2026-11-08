import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config.js';
import { dataStore } from '../db/dataStore.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['compliance_officer', 'reviewer', 'auditor', 'admin']).optional(),
  organization: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid input data', errors: parseResult.error.format() });
      return;
    }

    const { username, email, password, role, organization } = parseResult.data;
    const existing = await dataStore.users.findByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email address already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await dataStore.users.create({
      username,
      email,
      passwordHash,
      role: role || 'compliance_officer',
      organization: organization || 'Enterprise Procurement',
      avatarUrl: '/src/assets/images/avatar_compliance_officer_1794113145499.jpg',
    });

    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    await dataStore.auditLogs.log({
      userId: user._id.toString(),
      action: 'USER_REGISTERED',
      resourceType: 'USER',
      resourceId: user._id.toString(),
      details: { email, role: user.role }
    });

    res.status(201).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        avatarUrl: user.avatarUrl,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ success: false, message: 'Invalid credentials format' });
      return;
    }

    const { email, password } = parseResult.data;
    const user = await dataStore.users.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const accessToken = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    await dataStore.auditLogs.log({
      userId: user._id.toString(),
      action: 'USER_LOGIN',
      resourceType: 'USER',
      resourceId: user._id.toString(),
      details: { email }
    });

    res.json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        organization: user.organization,
        avatarUrl: user.avatarUrl,
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie('accessToken');
  if (req.user) {
    await dataStore.auditLogs.log({
      userId: req.user._id.toString(),
      action: 'USER_LOGOUT',
      resourceType: 'USER',
      resourceId: req.user._id.toString(),
    });
  }
  res.json({ success: true, message: 'Successfully logged out' });
});

// Current User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthenticated' });
    return;
  }
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      organization: req.user.organization,
      avatarUrl: req.user.avatarUrl,
    }
  });
});

export default router;
