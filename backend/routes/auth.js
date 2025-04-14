const express = require('express');
const router = express.Router();
const couchdb = require('../couchdb');
const { v4: uuidv4 } = require('uuid');

// Hardcoded admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

// Ensure the DB is ready before anything
router.use(async (req, res, next) => {
  await couchdb.ready;
  next();
});

router.post('/register', async (req, res) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    return res.status(400).send({ error: 'All fields are required.' });
  }

  try {
    const existing = await couchdb.users.find({ selector: { username } });

    if (existing.docs.length > 0) {
      return res.status(409).send({ error: 'User already exists.' });
    }

    const newUser = {
      _id: uuidv4(),
      username,
      password,
      name,
      isAdmin: false
    };

    await couchdb.users.insert(newUser);

    res.send({ success: true, message: 'User registered successfully.' });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).send({ error: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Handle admin login
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      req.session.user = { name: 'Admin', isAdmin: true };
      return res.send({ success: true, user: req.session.user });
    }

    const result = await couchdb.users.find({ selector: { username, password } });

    if (!result.docs.length) {
      return res.status(401).send({ error: 'Invalid username or password.' });
    }

    const user = result.docs[0];
    req.session.user = {
      id: user._id,
      name: user.name,
      username: user.username,
      isAdmin: false
    };

    res.send({ success: true, user: req.session.user });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send({ error: 'Server error during login.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send({ error: 'Logout failed.' });
    }
    res.send({ success: true });
  });
});

router.get('/me', (req, res) => {
  res.send({ user: req.session.user || null });
});

module.exports = router;
