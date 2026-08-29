const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to protect admin routes
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.redirect('/admin/login');
}

// 1. Login Page
router.get('/login', (req, res) => {
  res.render('admin/login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === adminUser && password === adminPass) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  res.render('admin/login', { error: 'Invalid username or password' });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

// 2. Main Admin Dashboard (Reads all tables)
router.get('/', requireAuth, async (req, res) => {
  try {
    const [profile, skills, experiences, education, projects, certs, feedback, messages] = await Promise.all([
      db.query('SELECT * FROM profile LIMIT 1;'),
      db.query('SELECT * FROM skills ORDER BY id ASC;'),
      db.query('SELECT * FROM experiences ORDER BY order_index ASC;'),
      db.query('SELECT * FROM education ORDER BY order_index ASC;'),
      db.query('SELECT * FROM projects ORDER BY id DESC;'),
      db.query('SELECT * FROM certifications ORDER BY id DESC;'),
      db.query('SELECT * FROM feedback ORDER BY id DESC;'),
      db.query('SELECT * FROM connect_messages ORDER BY created_at DESC;')
    ]);

    // Dynamic Navigation Schema with Real-Time Table Counts
    const navSections = [
      { id: 'profile', label: 'Profile Bio', icon: '👤', count: profile.rows.length ? 1 : 0 },
      { id: 'skills', label: 'Skills', icon: '⚡', count: skills.rows.length },
      { id: 'experience', label: 'Experiences', icon: '💼', count: experiences.rows.length },
      { id: 'projects', label: 'Projects', icon: '🚀', count: projects.rows.length },
      { id: 'education', label: 'Education', icon: '🎓', count: education.rows.length },
      { id: 'certifications', label: 'Certifications', icon: '📜', count: certs.rows.length },
      { id: 'feedback', label: 'Feedback', icon: '⭐', count: feedback.rows.length },
      { id: 'messages', label: 'Messages', icon: '✉️', count: messages.rows.length }
    ];

    res.render('admin/dashboard', {
      navSections,
      profile: profile.rows[0] || {},
      skills: skills.rows,
      experiences: experiences.rows,
      education: education.rows,
      projects: projects.rows,
      certifications: certs.rows,
      feedback: feedback.rows,
      messages: messages.rows
    });
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    res.status(500).send('Database Error: Failed to load admin dashboard.');
  }
});

// ==========================================
// CRUD OPERATIONS
// ==========================================

// --- Profile Update ---
router.post('/profile/update', requireAuth, async (req, res) => {
  const { name, headline, bio, github_username, linkedin_url, location, email } = req.body;
  try {
    const check = await db.query('SELECT id FROM profile LIMIT 1;');
    if (check.rows.length === 0) {
      await db.query(
        'INSERT INTO profile (name, headline, bio, github_username, linkedin_url, location, email) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [name, headline, bio, github_username, linkedin_url, location, email]
      );
    } else {
      await db.query(
        'UPDATE profile SET name=$1, headline=$2, bio=$3, github_username=$4, linkedin_url=$5, location=$6, email=$7 WHERE id=$8',
        [name, headline, bio, github_username, linkedin_url, location, email, check.rows[0].id]
      );
    }
    res.redirect('/admin#profile');
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// --- Skills (Create / Delete) ---
router.post('/skills/create', requireAuth, async (req, res) => {
  const { name, category } = req.body;
  await db.query('INSERT INTO skills (name, category) VALUES ($1, $2)', [name, category]);
  res.redirect('/admin#skills');
});

router.post('/skills/delete/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM skills WHERE id=$1', [req.params.id]);
  res.redirect('/admin#skills');
});

// --- Experiences (Create / Update / Delete) ---
router.post('/experiences/create', requireAuth, async (req, res) => {
  const { role, company, location, period, description, skills_used, order_index } = req.body;
  await db.query(
    'INSERT INTO experiences (role, company, location, period, description, skills_used, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [role, company, location, period, description, skills_used, order_index || 0]
  );
  res.redirect('/admin#experience');
});

router.post('/experiences/delete/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM experiences WHERE id=$1', [req.params.id]);
  res.redirect('/admin#experience');
});

// --- Education (Create / Delete) ---
router.post('/education/create', requireAuth, async (req, res) => {
  const { degree, institution, period, description, order_index } = req.body;
  await db.query(
    'INSERT INTO education (degree, institution, period, description, order_index) VALUES ($1, $2, $3, $4, $5)',
    [degree, institution, period, description, order_index || 0]
  );
  res.redirect('/admin#education');
});

router.post('/education/delete/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM education WHERE id=$1', [req.params.id]);
  res.redirect('/admin#education');
});

// --- Projects (Create / Delete) ---
router.post('/projects/create', requireAuth, async (req, res) => {
  const { title, category, description, technologies, live_url, github_url } = req.body;
  await db.query(
    'INSERT INTO projects (title, category, description, technologies, live_url, github_url) VALUES ($1, $2, $3, $4, $5, $6)',
    [title, category, description, technologies, live_url || null, github_url || null]
  );
  res.redirect('/admin#projects');
});

router.post('/projects/delete/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM projects WHERE id=$1', [req.params.id]);
  res.redirect('/admin#projects');
});

// --- Certifications (Create / Delete) ---
router.post('/certifications/create', requireAuth, async (req, res) => {
  const { title, issuer, issue_date, credential_url } = req.body;
  await db.query(
    'INSERT INTO certifications (title, issuer, issue_date, credential_url) VALUES ($1, $2, $3, $4)',
    [title, issuer, issue_date, credential_url || null]
  );
  res.redirect('/admin#certifications');
});

router.post('/certifications/delete/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM certifications WHERE id=$1', [req.params.id]);
  res.redirect('/admin#certifications');
});

// --- Feedback Moderation (Delete) ---
router.post('/feedback/delete/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM feedback WHERE id=$1', [req.params.id]);
  res.redirect('/admin#feedback');
});

// --- Received Messages (Delete) ---
router.post('/messages/delete/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM connect_messages WHERE id=$1', [req.params.id]);
  res.redirect('/admin#messages');
});

module.exports = router;