const express = require('express');
const router = express.Router();
const db = require('../couchdb');
const { v4: uuidv4 } = require('uuid');

router.use(async (req, res, next) => {
  await db.ready;
  next();
});

router.get('/', async (req, res) => {
  const result = await db.channels.list({ include_docs: true });
  const data = result.rows.map(row => row.doc);
  res.send(data);
});

router.post('/', async (req, res) => {
  if (!req.session.user) return res.status(403).send({ error: 'Unauthorized' });

  const { name } = req.body;
  if (!name) return res.status(400).send({ error: 'Channel name required' });

  const newChannel = {
    _id: uuidv4(),
    name,
    createdBy: req.session.user.name,
    createdAt: new Date().toISOString(),
  };

  await db.channels.insert(newChannel); // ✅ FIXED HERE
  res.send({ success: true, channel: newChannel });
});

module.exports = router;
