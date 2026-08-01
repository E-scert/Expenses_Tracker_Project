const express = require('express');
const router = express.Router();
const { runWithUser } = require('../db');
const { asyncHandler, formatPgError } = require('../middleware/asyncHandler');

const VALID_CATEGORIES = ['food', 'transport', 'entertainment', 'other'];
const VALID_PERIODS = ['overall', 'weekly', 'monthly'];

// GET /api/totals/:userId -> overall total via total_expenses(user_id)
router.get('/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await runWithUser(userId, async (client) => {
      return client.query('SELECT total_expenses($1) AS total', [userId]);
    });
    res.json({ user_id: Number(userId), total: Number(result.rows[0].total) });
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// GET /api/totals/:userId/breakdown?period=overall|weekly|monthly
// -> total per category via category_totals(cat_name, user_id, period)
router.get('/:userId/breakdown', asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const period = req.query.period || 'overall';
  if (!VALID_PERIODS.includes(period)) {
    return res.status(400).json({ error: `period must be one of: ${VALID_PERIODS.join(', ')}` });
  }
  try {
    const breakdown = await runWithUser(userId, async (client) => {
      const rows = [];
      for (const cat of VALID_CATEGORIES) {
        const r = await client.query('SELECT category_totals($1, $2, $3) AS total', [cat, userId, period]);
        rows.push({ category_name: cat, total: Number(r.rows[0].total) });
      }
      return rows;
    });
    res.json({ user_id: Number(userId), period, breakdown });
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// GET /api/totals/:userId/:category?period=overall|weekly|monthly -> single category total
router.get('/:userId/:category', asyncHandler(async (req, res) => {
  const { userId, category } = req.params;
  const period = req.query.period || 'overall';
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }
  if (!VALID_PERIODS.includes(period)) {
    return res.status(400).json({ error: `period must be one of: ${VALID_PERIODS.join(', ')}` });
  }
  try {
    const result = await runWithUser(userId, async (client) => {
      return client.query('SELECT category_totals($1, $2, $3) AS total', [category, userId, period]);
    });
    res.json({ user_id: Number(userId), category_name: category, period, total: Number(result.rows[0].total) });
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

module.exports = router;
