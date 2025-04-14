import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/users/me', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-black text-yellow-400 font-sans">
      <header className="bg-yellow-400 text-black shadow-md p-4 flex justify-between items-center">
  <h1 className="text-2xl font-bold">My Portfolio</h1>
  
  <div className="flex items-center justify-between w-full ml-4">
    {/* Left nav links */}
    <nav className="space-x-4">
      <Link to="/" className="hover:underline">Home</Link>
      <Link to="/forum" className="hover:underline">Forum</Link>
      <Link to="/search" className="hover:underline">Search</Link>
      {!user && <Link to="/login" className="hover:underline">Login</Link>}
      {!user && <Link to="/register" className="hover:underline">Register</Link>}
    </nav>

    {/* Right-aligned user info and logout */}
    {user && (
      <div className="ml-auto flex items-center space-x-2">
        <span className="text-black font-medium">Hi, {user.name}</span>
        <button
          onClick={async () => {
            await fetch('http://localhost:4000/api/users/logout', {
              method: 'POST',
              credentials: 'include'
            });
            setUser(null);
          }}
          className="text-red-500 hover:underline"
        >
          Logout
        </button>
      </div>
    )}
  </div>
</header>

        <main className="p-6">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/forum" element={user ? <Forum /> : <Navigate to="/login" replace />} />
            <Route path="/channel/:channelId" element={user ? <Channel /> : <Navigate to="/login" replace />} />
            <Route path="/search" element={user ? <Search /> : <Navigate to="/login" replace />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Login({ setUser }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await fetch('http://localhost:4000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, password })
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      navigate('/forum');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <input type="text" placeholder="User ID" value={id} onChange={e => setId(e.target.value)} className="mb-2 p-2 border w-full rounded" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 p-2 border w-full rounded" />
      <button onClick={handleLogin} className="bg-[#FFD700] text-black px-4 py-2 rounded font-bold hover:bg-[#fef08a] transition-all shadow-lg glow-gold"
      >Login</button>
    </div>
  );
}

function Register() {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    const res = await fetch('http://localhost:4000/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, password })
    });

    if (res.ok) {
      alert('Registration successful! Please login.');
      navigate('/login');
    } else {
      alert('Registration failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      <input type="text" placeholder="User ID" value={id} onChange={e => setId(e.target.value)} className="mb-2 p-2 border w-full rounded" />
      <input type="text" placeholder="Display Name" value={name} onChange={e => setName(e.target.value)} className="mb-2 p-2 border w-full rounded" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 p-2 border w-full rounded" />
      <button onClick={handleRegister} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Register</button>
    </div>
  );
}

function Landing() {
  return (
    <div className="text-center max-w-4xl mx-auto bg-white/10 backdrop-blur-md shadow-2xl p-10 rounded-3xl border border-yellow-400">
      <div className="relative inline-block mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-lg blur-xl opacity-50 animate-pulse"></div>
        <h2 className="relative text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 drop-shadow-lg">
          Welcome to My Portfolio
        </h2>
      </div>
      <p className="mb-8 text-lg text-yellow-200 font-light">
        This is my for <span className="font-semibold text-yellow-400">Portfolio</span>.<br />
        This was made using React, Node.js <span className="italic text-red-400">and CouchDB.</span>
      </p>
      <Link
  to="/forum"
  className="no-underline block bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-full text-lg transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-yellow-400/60"
>
  Enter the Forum 🚀
</Link>

    </div>
  );
}


function Forum() {
  const [channels, setChannels] = useState([]);
  const [channelName, setChannelName] = useState('');

  const fetchChannels = () => {
    fetch('http://localhost:4000/api/channels')
      .then(res => res.json())
      .then(data => setChannels(data));
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const createChannel = () => {
    if (!channelName.trim()) return;

    fetch('http://localhost:4000/api/channels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: channelName })
    }).then(() => {
      setChannelName('');
      fetchChannels();
    });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Channels</h2>
      <div className="flex mb-6 space-x-2">
        <input
          value={channelName}
          onChange={e => setChannelName(e.target.value)}
          className="p-2 border rounded flex-1"
          placeholder="New channel name"
        />
        <button onClick={createChannel} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create</button>
      </div>
      <ul className="grid gap-4">
  {channels.map(c => (
    <li key={c._id} className="bg-white p-4 shadow rounded">
      <Link
  to={`/channel/${c._id}`}
  style={{
    color: '#FFD700',
    textShadow: '0 0 6px rgba(255, 215, 0, 0.7)'
  }}
  className="text-lg font-bold transition-all"
>
  {c.name}
</Link>


    </li>
  ))}
</ul>

    </div>
  );
}

function Channel() {
  const { channelId } = useParams();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyImage, setReplyImage] = useState(null);
  const [replyTo, setReplyTo] = useState(null);

  const fetchPosts = () => {
    fetch(`http://localhost:4000/api/posts/${channelId}/nested`)
      .then(res => res.json())
      .then(data => setPosts(data));
  };

  useEffect(() => {
    fetchPosts();
  }, [channelId]);

  const postMessage = async (parentId = null, replyText = '', replyImg = null) => {
    const postContent = parentId ? replyText : content;
    let base64Image = null;

    if (parentId && replyImg) {
      base64Image = await toBase64(replyImg);
    } else if (!parentId && image) {
      base64Image = await toBase64(image);
    }

    fetch('http://localhost:4000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ channelId, content: postContent, parentId, image: base64Image })
    }).then(() => {
      fetchPosts();
      if (parentId) {
        setReplyContent('');
        setReplyImage(null);
      } else {
        setContent('');
        setImage(null);
      }
      setReplyTo(null);
    });
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });

  const vote = (postId, type) => {
    fetch('http://localhost:4000/api/posts/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, type })
    }).then(fetchPosts);
  };

  const renderPosts = (list, level = 0) => list.map(post => (
    <div key={post._id} style={{ marginLeft: `${level * 20}px` }} className="border-l-2 border-gray-300 pl-4 my-4">
      <div className="bg-white p-3 rounded shadow">
        <p className="mb-2"><b>{post.createdBy}:</b> {post.content}</p>
        {post.image && typeof post.image === 'string' && post.image.startsWith('data:image') && (
          <img src={post.image} alt="screenshot" className="mb-2 rounded max-w-xs border" />
        )}
        <div className="flex items-center space-x-2 mb-2">
          <button onClick={() => vote(post._id, 'up')} className="text-green-600">👍 {post.upvotes}</button>
          <button onClick={() => vote(post._id, 'down')} className="text-red-600">👎 {post.downvotes}</button>
          <button onClick={() => setReplyTo(replyTo === post._id ? null : post._id)} className="text-blue-600">Reply</button>
        </div>
        {replyTo === post._id && (
          <div className="mb-2">
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              className="w-full p-2 border rounded mb-1"
              placeholder="Your reply..."
            />
            <input type="file" accept="image/*" onChange={e => setReplyImage(e.target.files[0])} className="block mb-2" />
            <button onClick={() => postMessage(post._id, replyContent, replyImage)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Send</button>
          </div>
        )}
      </div>
      {post.replies && renderPosts(post.replies, level + 1)}
    </div>
  ));
  

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Posts</h2>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full p-2 border rounded mb-2"
        placeholder="Type your message here..."
      />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} className="block mb-2" />
      <button onClick={() => postMessage()} className="bg-[#FFD700] text-black px-4 py-2 rounded font-bold hover:bg-[#fef08a] transition-all shadow-lg glow-gold"
      >Post</button>
      {renderPosts(posts)}
    </div>
  );
}

function Search() {
  const [type, setType] = useState("content");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    fetch("http://localhost:4000/api/posts/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, query }),
    })
      .then((res) => res.json())
      .then((data) => setResults(data));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Search</h2>
      <div className="flex items-center space-x-2 mb-4">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="content">By Content</option>
          <option value="user">By User</option>
          <option value="topUser">Top Users</option>
        </select>
        {type !== "topUser" && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="p-2 border rounded flex-1"
          />
        )}
        <button
          onClick={handleSearch}
          className="bg-[#FFD700] text-black px-4 py-2 rounded font-bold hover:bg-[#fef08a] transition-all shadow-lg glow-gold"
        >
          Search
        </button>
      </div>

      {/* Custom human-readable results */}
      {type === "topUser" ? (
        <div className="bg-white p-4 rounded shadow space-y-2">
          <h3 className="text-lg font-bold mb-2">🔝 Top Users</h3>
          {results.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {results.map((user, index) => (
                <li key={index}>
                  <strong>{user.user === "undefined" ? "Deleted User" : user.user}</strong>{" "}
                  — {user.count} {user.count === 1 ? "post" : "posts"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow space-y-4">
          {results.length > 0 ? (
            results.map((post, index) => (
              <div
                key={index}
                className="border-b border-gray-300 pb-2 mb-2 text-sm"
              >
                <p>
                  <strong>Post by:</strong>{" "}
                  {post.createdBy === "undefined" ? "Deleted User" : post.createdBy}
                </p>
                <p>
                  <strong>Content:</strong> {post.content}
                </p>
                {post.image && post.image.startsWith("data:image") && (
                  <img
                    src={post.image}
                    alt="attached"
                    className="mt-2 max-w-xs rounded border"
                  />
                )}
              </div>
            ))
          ) : (
            <p>No matching posts found.</p>
          )}
        </div>
      )}
    </div>
  );
}


export default App;
