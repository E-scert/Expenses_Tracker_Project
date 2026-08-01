const express = require('express');
const router = express.Router();
const { runWithUser } = require('../db');
const { asyncHandler, formatPgError } = require('../middleware/asyncHandler');

// GET /api/expenses?user_id=1 -> list a user's expenses, joined with category name
router.get('/', asyncHandler(async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id query param is required.' });
  try {
    const result = await runWithUser(user_id, async (client) => {
      return client.query(
        `SELECT e.expense_id, e.amount, e.user_id, e.created_at,
                c.category_id, c.category_name
         FROM expenses e
         LEFT JOIN categorized_expenses ce ON ce.expense_id = e.expense_id
         LEFT JOIN categories c ON c.category_id = ce.category_id
         WHERE e.user_id = $1
         ORDER BY e.created_at DESC, e.expense_id DESC`,
        [user_id]
      );
    });
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// POST /api/expenses { user_id, amount, category_id } -> CALL add_expense(user_id, amount, category_id)
router.post('/', asyncHandler(async (req, res) => {
  const { user_id, amount, category_id } = req.body;
  if (!user_id || amount === undefined || !category_id) {
    return res.status(400).json({ error: 'user_id, amount and category_id are required.' });
  }
  if (Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be greater than 0.' });
  }
  try {
    await runWithUser(user_id, async (client) => {
      await client.query('CALL add_expense($1, $2, $3)', [user_id, amount, category_id]);
    });
    const created = await runWithUser(user_id, async (client) => {
      return client.query(
        `SELECT e.expense_id, e.amount, e.user_id, e.created_at, c.category_id, c.category_name
         FROM expenses e
         LEFT JOIN categorized_expenses ce ON ce.expense_id = e.expense_id
         LEFT JOIN categories c ON c.category_id = ce.category_id
         WHERE e.user_id = $1
         ORDER BY e.expense_id DESC LIMIT 1`,
        [user_id]
      );
    });
    res.status(201).json(created.rows[0]);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// PUT /api/expenses/:id { user_id, amount } -> CALL update_expense(id, amount)
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id, amount } = req.body;
  if (!user_id || amount === undefined) {
    return res.status(400).json({ error: 'user_id and amount are required.' });
  }
  if (Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be greater than 0.' });
  }
  try {
    await runWithUser(user_id, async (client) => {
      await client.query('CALL update_expense($1, $2)', [id, amount]);
    });
    const updated = await runWithUser(user_id, async (client) => {
      return client.query('SELECT expense_id, amount, user_id, created_at FROM expenses WHERE expense_id = $1', [id]);
    });
    if (updated.rows.length === 0) return res.status(404).json({ error: `Expense id ${id} does not exist.` });
    res.json(updated.rows[0]);
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

// DELETE /api/expenses/:id { user_id, category_id } -> CALL delete_expense(category_id, expense_id)
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user_id, category_id } = req.body;
  if (!user_id || !category_id) {
    return res.status(400).json({ error: 'user_id and category_id are required in the request body.' });
  }
  try {
    await runWithUser(user_id, async (client) => {
      await client.query('CALL delete_expense($1, $2)', [category_id, id]);
    });
    res.json({ message: `Expense ${id} deleted (if it existed).` });
  } catch (err) {
    res.status(400).json({ error: formatPgError(err) });
  }
}));

module.exports = router;
