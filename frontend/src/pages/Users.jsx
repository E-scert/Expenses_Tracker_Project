import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useActiveUser } from '../context/UserContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Button, SectionHeading } from '../components/ui.jsx';

export default function Users() {
  const { activeUser, setActiveUser, clearActiveUser } = useActiveUser();
  const toast = useToast();
  const navigate = useNavigate();

  const [renameValue, setRenameValue] = useState(activeUser?.user_name || '');
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleRename(e) {
    e.preventDefault();
    if (!activeUser || !renameValue.trim()) return;
    setRenaming(true);
    try {
      const updated = await api.updateUser(activeUser.user_id, renameValue.trim());
      setActiveUser(updated);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRenaming(false);
    }
  }

  async function handleDelete() {
    if (!activeUser) return;
    if (!confirm(`Delete profile "${activeUser.user_name}" and all of their data? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.deleteUser(activeUser.user_id);
      toast.success('Profile deleted.');
      clearActiveUser();
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <SectionHeading
        eyebrow="Identity"
        title="Profile"
        subtitle="Manage the profile you're currently logged in as. Every request is scoped to this user — the database's row-level security enforces it at query time."
      />

      <Card className="animate-riseIn">
        <div className="flex items-center gap-3 font-mono text-sm text-paper/60 mb-6">
          
          <span className="rounded-full border border-line px-2.5 py-1">
            joined {activeUser.created_at ? new Date(activeUser.created_at).toLocaleDateString() : '—'}
          </span>
        </div>

        <form onSubmit={handleRename} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Username">
              <Input
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                maxLength={20}
                required
              />
            </Field>
          </div>
          <Button type="submit" disabled={renaming}>{renaming ? 'Saving…' : 'Save name'}</Button>
        </form>

        <div className="mt-6 border-t border-line pt-5">
          <p className="mb-3 text-sm text-paper/45">Deleting a profile also removes its categories and expenses.</p>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete profile'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
