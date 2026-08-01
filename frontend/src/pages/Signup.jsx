import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useActiveUser } from '../context/UserContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Button } from '../components/ui.jsx';

export default function Signup() {
  const { activeUser, setActiveUser } = useActiveUser();
  const toast = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (activeUser) navigate('/', { replace: true });
  }, [activeUser, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    setBusy(true);
    try {
      const user = await api.createUser(name);
      setActiveUser(user);
      toast.success(`Profile created for ${user.user_name}.`);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blaze shadow-blaze" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-paper">
            LEDGER<span className="text-blaze">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-paper/45">Create a profile to start tracking.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Username">
              <Input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                maxLength={20}
                required
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? '…' : 'Create profile'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-paper/35">
            Already have a profile?{' '}
            <Link to="/login" className="text-blaze underline underline-offset-2">
              Log in
            </Link>
            .
          </p>
        </Card>

        <p className="mt-6 text-center">
          <Link to="/welcome" className="text-xs text-paper/30 underline underline-offset-2 hover:text-paper/50">
            ← back
          </Link>
        </p>
      </div>
    </div>
  );
}