const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');
const { sendTelegramAlert } = require('./utils/notifier');
require('dotenv').config();

const app = express();
const session = require('express-session');
const adminRoutes = require('./routes/admin');

// 1. Template Engine & Static Assets
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// 2. Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: Fetch Repositories from GitHub API Server-Side
async function getGitHubRepos(username) {
  if (!username) return [];
  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, {
      headers: {
        'User-Agent': 'NodeJS-Portfolio-App'
      }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (err) {
    console.error('GitHub API error:', err.message);
    return [];
  }
}

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key_387492',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Mount separate admin route
app.use('/admin', adminRoutes);

// --------------------------------------------------------------------------
// MAIN SERVER-SIDE RENDERED (SSR) ROUTE
// --------------------------------------------------------------------------
// Main SSR Route
app.get('/', async (req, res) => {
  try {
    const [profileRes, skillsRes, expRes, eduRes, projRes, certsRes, feedbackRes] = await Promise.all([
      db.query('SELECT * FROM profile LIMIT 1;'),
      db.query('SELECT * FROM skills ORDER BY id ASC;').catch(() => ({ rows: [] })),
      db.query('SELECT * FROM experiences ORDER BY order_index ASC;').catch(() => ({ rows: [] })),
      db.query('SELECT * FROM education ORDER BY order_index ASC;').catch(() => ({ rows: [] })),
      db.query('SELECT * FROM projects ORDER BY id DESC;').catch(() => ({ rows: [] })),
      db.query('SELECT * FROM certifications ORDER BY id DESC;').catch(() => ({ rows: [] })),
      db.query('SELECT * FROM feedback ORDER BY id DESC;').catch(() => ({ rows: [] }))
    ]);

    const profile = profileRes.rows[0] || {
      name: 'Shashank Singh Bisht',
      headline: 'Senior Android & AI Application Developer',
      bio: '6+ years building enterprise Android systems, Kotlin Multiplatform solutions, and local AI agent pipelines.',
      github_username: 'MrShashankBisht',
      linkedin_url: 'https://www.linkedin.com/in/mr-shashankbisht/'
    };

    const repos = await getGitHubRepos(profile.github_username);

    res.render('index', {
      profile,
      skills: skillsRes.rows,
      experiences: expRes.rows,
      education: eduRes.rows,
      projects: projRes.rows,
      certifications: certsRes.rows,
      feedback: feedbackRes.rows,
      repos
    });
  } catch (err) {
    console.error('Error rendering homepage:', err);
    res.status(500).send('Server Error: Failed to load portfolio data.');
  }
});

// --------------------------------------------------------------------------
// REST API ENDPOINTS
// --------------------------------------------------------------------------

// 1. Get Profile Details
app.get('/api/profile', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM profile LIMIT 1;');
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Skills
app.get('/api/skills', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM skills ORDER BY id ASC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Experience Journey
app.get('/api/experiences', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM experiences ORDER BY order_index ASC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Featured Projects
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM projects ORDER BY id DESC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Certifications
app.get('/api/certifications', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM certifications ORDER BY id DESC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get All Feedback
app.get('/api/feedback', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM feedback ORDER BY id DESC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Post New Feedback (with source verification URL)
app.post('/api/feedback', async (req, res) => {
  const { client_name, designation, message, rating, source_url } = req.body;
  
  if (!client_name || !message) {
    return res.status(400).json({ error: 'Name and message are required.' });
  }
  
  try {
    await sendTelegramAlert(`⭐ <b>New Feedback Submitted!</b>\n\n<b>From:</b> ${client_name} (${designation})\n<b>Rating:</b> ${rating}★\n<b>Message:</b> "${message}"`);
    const query = `
      INSERT INTO feedback (client_name, designation, message, rating, source_url)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
    `;
    const { rows } = await db.query(query, [
      client_name.trim(),
      (designation || '').trim(),
      message.trim(),
      parseInt(rating, 10) || 5,
      source_url ? source_url.trim() : null
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Post Connect / Contact Message
app.post('/api/connect', async (req, res) => {
  const { sender_name, sender_email, subject, message } = req.body;
  
  if (!sender_name || !sender_email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and message.' });
  }

  try {
    await sendTelegramAlert(`🚀 <b>New Connect Inquiry!</b>\n\n<b>From:</b> ${sender_name} (${sender_email})\n<b>Subject:</b> ${subject}\n<b>Message:</b>\n${message}`);
    const query = `
      INSERT INTO connect_messages (sender_name, sender_email, subject, message)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const { rows } = await db.query(query, [
      sender_name.trim(),
      sender_email.trim(),
      (subject || '').trim(),
      message.trim()
    ]);
    res.status(201).json({ success: true, record: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get all the education : /api/education REST Endpoint
app.get('/api/education', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM education ORDER BY order_index ASC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------------------------------
// SERVER INITIALIZATION
// --------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Portfolio server running on http://localhost:${PORT}`);
});