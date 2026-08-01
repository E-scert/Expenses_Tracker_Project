import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useActiveUser } from '../context/UserContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Select, Button, SectionHeading, EmptyState, Spinner } from '../components/ui.jsx';

const CATEGORY_OPTIONS = ['food', 'transport', 'entertainment', 'other'];

const DOT_COLOR = {
  food: 'bg-orange-400',
  transport: 'bg-sky-400',
  entertainment: 'bg-violet-400',
  other: 'bg-paper/40',
};

export default function Categories() {
  const { activeUser } = useActiveUser();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState(CATEGORY_OPTIONS[0]);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    if (!activeUser) return;
    setLoading(true);
    try {
      const rows = await api.listCategories(activeUser.user_id);
      setCategories(rows);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [activeUser?.user_id]); // eslint-disable-line

  async function handleCreate(e) {
    e.preventDefault();
    if (!activeUser) return;
    setCreating(true);
    try {
      await api.createCategory(activeUser.user_id, newCategory);
      toast.success(`Category "${newCategory}" added.`);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(cat, category_name) {
    setBusyId(cat.category_id);
    try {
      await api.updateCategory(cat.category_id, activeUser.user_id, category_name);
      toast.success('Category updated.');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(cat) {
    if (!confirm(`Delete category "${cat.category_name}"? Expenses tagged with it will lose that tag.`)) return;
    setBusyId(cat.category_id);
    try {
      await api.deleteCategory(cat.category_id, activeUser.user_id);
      toast.success('Category deleted.');
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
        <SectionHeading eyebrow="Organize" title="Categories" />
        <EmptyState title="No active user" subtitle="Log in first from the login screen." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <SectionHeading
        eyebrow="Organize"
        title="Categories"
        subtitle={`Categories for ${activeUser.user_name} — food, transport, entertainment, or other.`}
      />

      <Card className="mb-6 animate-riseIn">
        <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Category">
              <Select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit" disabled={creating}>{creating ? 'Adding…' : 'Add category'}</Button>
        </form>
      </Card>

      {loading ? (
        <Spinner />
      ) : categories.length === 0 ? (
        <EmptyState title="No categories yet" subtitle="Add your first one above." />
      ) : (
        <div className="stagger flex flex-col gap-3">
          {categories.map((cat) => (
            <Card key={cat.category_id} className="animate-fadeUp flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLOR[cat.category_name] || 'bg-paper/30'}`} />
                <div>
                  <p className="font-mono text-sm text-paper">{cat.category_name}</p>
                  <p className="text-xs text-paper/35">#{cat.category_id} · added {new Date(cat.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={cat.category_name}
                  disabled={busyId === cat.category_id}
                  onChange={(e) => handleRename(cat, e.target.value)}
                  className="py-1.5 text-xs"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
                <Button variant="danger" onClick={() => handleDelete(cat)} disabled={busyId === cat.category_id}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
