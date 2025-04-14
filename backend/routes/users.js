const express = require('express');
const router = express.Router();
const db = require('../couchdb');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Ensure DB ready
router.use(async (req, res, next) => {
  await db.ready;
  next();
});

// Register a new user
router.post('/register', async (req, res) => {
  const { id, password, name } = req.body;
  if (!id || !password || !name) return res.status(400).send({ error: 'Missing required fields' });

  try {
    const existing = await db.users.get(id).catch(() => null);
    if (existing) return res.status(409).send({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      _id: id,
      password: hashed,
      name,
      isAdmin: id === 'admin', // Hardcoded admin account
    };

    await db.users.insert(newUser);
    res.send({ success: true });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).send({ error: 'Failed to register' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  if (!id || !password) return res.status(400).send({ error: 'Missing credentials' });

  try {
    const user = await db.users.get(id);
    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(401).send({ error: 'Invalid password' });

    req.session.user = {
      id: user._id,
      name: user.name,
      isAdmin: user.isAdmin || false,
    };

    res.send({ success: true, user: req.session.user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).send({ error: 'Invalid login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.send({ success: true });
  });
});

// Get current session user
router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).send({ error: 'Not logged in' });
  res.send(req.session.user);
});

module.exports = router;