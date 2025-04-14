const express = require('express');
const router = express.Router();
const db = require('../couchdb');
const { v4: uuidv4 } = require('uuid');

// Create a new post or reply
router.post('/', async (req, res) => {
  if (!req.session.user) return res.status(403).send({ error: 'Unauthorized' });
  const { channelId, content, parentId } = req.body;
  const image = typeof req.body.image === 'string' && req.body.image.startsWith('data:image/') 
  ? req.body.image 
  : null;


  const post = {
    _id: uuidv4(),
    channelId,
    content,
    parentId: parentId || null,
    createdBy: req.session.user.name,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
  };
  if (image) post.image = image;


  await db.posts.insert(post);
  res.send({ success: true, post });
});

// Get flat posts for a channel
router.get('/:channelId', async (req, res) => {
  const result = await db.posts.find({ selector: { channelId: req.params.channelId } });
  res.send(result.docs);
});

// Get nested post structure for a channel
router.get('/:channelId/nested', async (req, res) => {
  const result = await db.posts.find({ selector: { channelId: req.params.channelId } });

  const postsById = {};
  const rootPosts = [];

  result.docs.forEach(post => {
    post.replies = [];
    postsById[post._id] = post;
  });

  result.docs.forEach(post => {
    if (post.parentId && postsById[post.parentId]) {
      postsById[post.parentId].replies.push(post);
    } else if (!post.parentId) {
      rootPosts.push(post);
    }
  });

  res.send(rootPosts);
});

// Upvote or downvote a post
router.post('/vote', async (req, res) => {
  const { postId, type } = req.body;
  try {
    const post = await db.posts.get(postId);
    if (type === 'up') post.upvotes += 1;
    if (type === 'down') post.downvotes += 1;
    await db.posts.insert(post);
    res.send({ success: true, post });
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).send({ error: 'Failed to vote' });
  }
});

// Search posts
// Search posts
router.post('/search', async (req, res) => {
  const { query, type } = req.body;

  try {
    const all = await db.posts.list({ include_docs: true });

    if (type === 'content') {
      const filtered = all.rows
        .map(r => r.doc)
        .filter(post => post.content?.toLowerCase().includes(query.toLowerCase()));
      return res.send(filtered);
    }

    if (type === 'user') {
      const filtered = all.rows
        .map(r => r.doc)
        .filter(post => post.createdBy?.toLowerCase() === query.toLowerCase());
      return res.send(filtered);
    }

    if (type === 'topUser') {
      const count = {};
      all.rows.forEach(row => {
        const u = row.doc.createdBy;
        count[u] = (count[u] || 0) + 1;
      });
      const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
      return res.send(sorted.map(([user, count]) => ({ user, count })));
    }

    if (type === 'leastUser') {
      const count = {};
      all.rows.forEach(row => {
        const u = row.doc.createdBy;
        count[u] = (count[u] || 0) + 1;
      });
      const sorted = Object.entries(count).sort((a, b) => a[1] - b[1]);
      return res.send(sorted.map(([user, count]) => ({ user, count })));
    }

    if (type === 'highestRank') {
      const scores = {};
      all.rows.forEach(row => {
        const { createdBy, upvotes = 0 } = row.doc;
        scores[createdBy] = (scores[createdBy] || 0) + upvotes;
      });
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      return res.send(sorted.map(([user, score]) => ({ user, score })));
    }

    if (type === 'lowestRank') {
      const scores = {};
      all.rows.forEach(row => {
        const { createdBy, downvotes = 0 } = row.doc;
        scores[createdBy] = (scores[createdBy] || 0) + downvotes;
      });
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      return res.send(sorted.map(([user, score]) => ({ user, score })));
    }

    return res.status(400).send({ error: 'Unknown search type' });
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).send({ error: 'Search failed' });
  }
});


module.exports = router;
