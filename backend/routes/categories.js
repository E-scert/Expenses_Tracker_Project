const express = require('express');
const router = express.Router();
const { runWithUser } = require('../db');
const { asyncHandler, formatPgError } = require('../middleware/asyncHandler');

const VALID_CATEGORIES = ['food', 'transport', 'entertainment', 'other'];

// GET /api/categories?user_id=1 -> list a user's categories
router.get('/', asyncHandler(async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id query param is required.' });
  try {
    const result = await runWithUser(user_id, async (client) => {
      return client.query(
        'SELECT category_id, category_name, user_id, created_at FROM categories WHERE user_id = $1 ORDER BY created_at DESC',
        [user_id]
      );
    });
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// POST /api/categories { user_id, category_name } -> CALL add_category(user_id, category_name)
router.post('/', asyncHandler(async (req, res) => {
  const { user_id, category_name } = req.body;
  if (!user_id || !category_name) {
    return res.status(400).json({ error: 'user_id and category_name are required.' });
  }
  if (!VALID_CATEGORIES.includes(category_name)) {
    return res.status(400).json({ error: `category_name must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }
  try {
    await runWithUser(user_id, async (client) => {
      await client.query('CALL add_category($1, $2)', [user_id, category_name]);
    });
    const created = await runWithUser(user_id, async (client) => {
      return client.query(
        'SELECT category_id, category_name, user_id, created_at FROM categories WHERE user_id = $1 AND category_name = $2 ORDER BY created_at DESC LIMIT 1',
        [user_id, category_name]
      );
    });
    res.status(201).json(created.rows[0]);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// PUT /api/categories/:id { user_id, category_name } -> CALL update_category(id, category_name)
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id, category_name } = req.body;
  if (!user_id || !category_name) {
    return res.status(400).json({ error: 'user_id and category_name are required.' });
  }
  if (!VALID_CATEGORIES.includes(category_name)) {
    return res.status(400).json({ error: `category_name must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }
  try {
    await runWithUser(user_id, async (client) => {
      await client.query('CALL update_category($1, $2)', [id, category_name]);
    });
    const updated = await runWithUser(user_id, async (client) => {
      return client.query('SELECT category_id, category_name, user_id, created_at FROM categories WHERE category_id = $1', [id]);
    });
    if (updated.rows.length === 0) return res.status(404).json({ error: `Category id ${id} does not exist.` });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// DELETE /api/categories/:id  { user_id in body } -> CALL delete_category(id)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id is required in the request body.' });
  try {
    await runWithUser(user_id, async (client) => {
      await client.query('CALL delete_category($1)', [id]);
    });
    res.json({ message: `Category ${id} deleted (if it existed).` });
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

module.exports = router;
