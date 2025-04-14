const nano = require('nano')(process.env.COUCHDB_URL); // uses the environment variable

let channels, posts, users;

async function setupDB(name) {
  while (true) {
    try {
      await nano.db.get(name);
      break;
    } catch (err) {
      if (err.reason === 'Database does not exist.') {
        await nano.db.create(name);
        break;
      }
      console.log(`Waiting for CouchDB to be ready: ${err.message}`);
      await new Promise(res => setTimeout(res, 2000));
    }
  }
  return nano.db.use(name);
}

const ready = (async () => {
  channels = await setupDB('channels');
  posts = await setupDB('posts');
  users = await setupDB('users');
})();

module.exports = {
  ready,
  get channels() { return channels; },
  get posts() { return posts; },
  get users() { return users; }
};
