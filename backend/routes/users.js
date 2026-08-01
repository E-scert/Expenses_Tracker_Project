const express = require('express');
const router = express.Router();
const { runWithUser } = require('../db');
const { asyncHandler, formatPgError } = require('../middleware/asyncHandler');

// GET /api/users/lookup/:username  -> resolve a username to a user_id, for the login screen.
// NOTE: this necessarily runs without a user context (we don't know the id yet), so it only
// works while the backend connects as the schema's owning role (which bypasses RLS). If you
// later lock this down with a non-owner app role + FORCE ROW LEVEL SECURITY, this lookup will
// need to move to a role that's allowed to read usernames, since RLS otherwise has no way to
// let you find your own id before you're "logged in".
router.get('/lookup/:username', asyncHandler(async (req, res) => {
  const { username } = req.params;
  try {
    const result = await runWithUser(null, async (client) => {
      return client.query('SELECT user_id, user_name, created_at FROM users WHERE user_name = $1', [username]);
    });
    if (result.rows.length === 0) return res.status(404).json({ error: `No user named "${username}".` });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// GET /api/users/:id  -> fetch a single user's profile (self only, per RLS)
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const result = await runWithUser(id, async (client) => {
      return client.query('SELECT user_id, user_name, created_at FROM users WHERE user_id = $1', [id]);
    });
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// POST /api/users  { user_name } -> CALL add_user(user_name)
router.post('/', asyncHandler(async (req, res) => {
  const { user_name } = req.body;
  if (!user_name || !user_name.trim()) {
    return res.status(400).json({ error: 'user_name is required.' });
  }
  try {
    // No user context exists yet — this runs as the connecting (owner) role.
    await runWithUser(null, async (client) => {
      await client.query('CALL add_user($1)', [user_name.trim()]);
    });
    const created = await runWithUser(null, async (client) => {
      return client.query('SELECT user_id, user_name, created_at FROM users WHERE user_name = $1', [user_name.trim()]);
    });
    res.status(201).json(created.rows[0] || { user_name: user_name.trim() });
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// PUT /api/users/:id  { user_name } -> CALL update_user(id, user_name)
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_name } = req.body;
  if (!user_name || !user_name.trim()) {
    return res.status(400).json({ error: 'user_name is required.' });
  }
  try {
    await runWithUser(id, async (client) => {
      await client.query('CALL update_user($1, $2)', [id, user_name.trim()]);
    });
    const updated = await runWithUser(id, async (client) => {
      return client.query('SELECT user_id, user_name, created_at FROM users WHERE user_id = $1', [id]);
    });
    if (updated.rows.length === 0) return res.status(404).json({ error: `User id ${id} does not exist.` });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// DELETE /api/users/:id -> CALL delete_user(id)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await runWithUser(id, async (client) => {
      await client.query('CALL delete_user($1)', [id]);
    });
    res.json({ message: `User ${id} deleted (if it existed).` });
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

module.exports = router;
