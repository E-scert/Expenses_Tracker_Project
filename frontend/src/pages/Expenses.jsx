import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useActiveUser } from '../context/UserContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Select, Button, SectionHeading, EmptyState, Spinner } from '../components/ui.jsx';

export default function Expenses() {
  const { activeUser } = useActiveUser();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [busyId, setBusyId] = useState(null);

  async function load() {
    if (!activeUser) return;
    setLoading(true);
    try {
      const [cats, exps] = await Promise.all([
        api.listCategories(activeUser.user_id),
        api.listExpenses(activeUser.user_id),
      ]);
      setCategories(cats);
      setExpenses(exps);
      if (!categoryId && cats.length) setCategoryId(String(cats[0].category_id));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeUser?.user_id]); // eslint-disable-line

  async function handleCreate(e) {
    e.preventDefault();
    if (!activeUser || !categoryId || !amount) return;
    setCreating(true);
    try {
      await api.createExpense(activeUser.user_id, Number(amount), Number(categoryId));
      toast.success('Expense logged.');
      setAmount('');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  function startEdit(exp) {
    setEditingId(exp.expense_id);
    setEditAmount(String(exp.amount));
  }

  async function saveEdit(exp) {
    setBusyId(exp.expense_id);
    try {
      await api.updateExpense(exp.expense_id, activeUser.user_id, Number(editAmount));
      toast.success('Expense updated.');
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(exp) {
    if (!confirm('Delete this expense?')) return;
    setBusyId(exp.expense_id);
    try {
      await api.deleteExpense(exp.expense_id, activeUser.user_id, exp.category_id);
      toast.success('Expense deleted.');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (!activeUser) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-10">
        <SectionHeading eyebrow="Track" title="Expenses" />
        <EmptyState title="No active user" subtitle="Log in first from the login screen." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        eyebrow="Track"
        title="Expenses"
        subtitle={`Logged spending for ${activeUser.user_name}.`}
      />

      <Card className="mb-6 animate-riseIn">
        {categories.length === 0 ? (
          <p className="text-sm text-paper/45">
            You need at least one category before logging an expense —{' '}
            <a href="/categories" className="text-blaze underline underline-offset-2">add one here</a>.
          </p>
        ) : (
          <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-32">
              <Field label="Amount">
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Category">
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit" disabled={creating}>{creating ? 'Saving…' : 'Log expense'}</Button>
          </form>
        )}
      </Card>

      {loading ? (
        <Spinner />
      ) : expenses.length === 0 ? (
        <EmptyState title="No expenses yet" subtitle="Log your first expense above." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {expenses.map((exp) => (
            <Card key={exp.expense_id} className="animate-fadeUp flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="tabular font-mono text-base font-semibold text-white">
                  ${Number(exp.amount).toFixed(2)}
                </span>
                <span className="rounded-full border border-line px-2 py-0.5 text-xs text-paper/55">
                  {exp.category_name || 'uncategorized'}
                </span>
                <span className="text-xs text-paper/35">
                  {new Date(exp.created_at).toLocaleDateString()}
                </span>
              </div>

              {editingId === exp.expense_id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-24 py-1.5"
                  />
                  <Button onClick={() => saveEdit(exp)} disabled={busyId === exp.expense_id}>Save</Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => startEdit(exp)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(exp)} disabled={busyId === exp.expense_id}>
                    Delete
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
