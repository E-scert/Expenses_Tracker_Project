const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await res.json() : null;
  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

export const api = {
  // users
  getUser: (id) => request(`/users/${id}`),
  lookupUser: (username) => request(`/users/lookup/${encodeURIComponent(username)}`),
  createUser: (user_name) => request('/users', { method: 'POST', body: JSON.stringify({ user_name }) }),
  updateUser: (id, user_name) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify({ user_name }) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // categories
  listCategories: (user_id) => request(`/categories?user_id=${user_id}`),
  createCategory: (user_id, category_name) =>
    request('/categories', { method: 'POST', body: JSON.stringify({ user_id, category_name }) }),
  updateCategory: (id, user_id, category_name) =>
    request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ user_id, category_name }) }),
  deleteCategory: (id, user_id) =>
    request(`/categories/${id}`, { method: 'DELETE', body: JSON.stringify({ user_id }) }),

  // expenses
  listExpenses: (user_id) => request(`/expenses?user_id=${user_id}`),
  createExpense: (user_id, amount, category_id) =>
    request('/expenses', { method: 'POST', body: JSON.stringify({ user_id, amount, category_id }) }),
  updateExpense: (id, user_id, amount) =>
    request(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify({ user_id, amount }) }),
  deleteExpense: (id, user_id, category_id) =>
    request(`/expenses/${id}`, { method: 'DELETE', body: JSON.stringify({ user_id, category_id }) }),

  // totals
  getTotal: (user_id) => request(`/totals/${user_id}`),
  getBreakdown: (user_id, period) => request(`/totals/${user_id}/breakdown?period=${period}`),
};
