import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// import { prisma } from '../server';
import { simpleDb } from '../db';
import { validateUser, validateLogin } from '../utils/validation';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = validateUser.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role } = value;

    // Check if user already exists
    const existingUser = simpleDb.user.findUnique({
      email
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = simpleDb.user.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = validateLogin.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = simpleDb.user.findUnique({
      email
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, (user as any).password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: (user as any).id, email: (user as any).email, role: (user as any).role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: (user as any).id,
        name: (user as any).name,
        email: (user as any).email,
        role: (user as any).role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;