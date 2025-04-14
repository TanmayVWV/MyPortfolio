const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const couchdb = require('./couchdb');

const authRoutes = require('./routes/auth');
const channelRoutes = require('./routes/channels');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users'); 


const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
}));

app.get('/', (req, res) => {
  res.send('Backend is running.');
});

couchdb.ready.then(async () => {
  const existing = await couchdb.users.find({ selector: { username: "admin" } });
  if (existing.docs.length === 0) {
    await couchdb.users.insert({ username: "admin", password: "admin" });
    console.log("✅ Default admin user created.");
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes); 
  app.use('/api/channels', channelRoutes);
  app.use('/api/posts', postRoutes);

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
