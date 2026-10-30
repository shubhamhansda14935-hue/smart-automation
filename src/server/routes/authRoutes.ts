import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { authSchema, generateToken, authenticateToken, AuthenticatedRequest } from '../auth';

export const authRouter = Router();

// Register new user
authRouter.post('/register', (req: Request, res: Response) => {
  const parseResult = authSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid registration data' });
    return;
  }

  const { email, password, name } = req.body;
  const displayName = (name && name.trim()) || email.split('@')[0];

  try {
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, 'user')
    `).run(email, passwordHash, displayName);

    const userId = Number(result.lastInsertRowid);
    const user = { id: userId, email, name: displayName, role: 'user' };
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account registered successfully',
      user,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login user
authRouter.post('/login', (req: Request, res: Response) => {
  const parseResult = authSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: parseResult.error.issues[0]?.message || 'Invalid login credentials format' });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = db.prepare('SELECT id, email, password_hash, name, role FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const authUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = generateToken(authUser);

    res.json({
      message: 'Login successful',
      user: authUser,
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Current user profile
authRouter.get('/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});
