import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useActiveUser } from '../context/UserContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Card, Field, Input, Button } from '../components/ui.jsx';

export default function Login() {
  const { setActiveUser } = useActiveUser();
  const toast = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const name = username.trim();
    if (!name) return;
    setBusy(true);
    try {
      const user = mode === 'login' ? await api.lookupUser(name) : await api.createUser(name);
      setActiveUser(user);
      toast.success(mode === 'login' ? `Welcome back, ${user.user_name}.` : `Profile created for ${user.user_name}.`);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-73px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm animate-riseIn">
        <div className="mb-8 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blaze shadow-blaze" />
          <h1 className="mt-3 font-display text-2xl font-semibold text-paper">
            LEDGER<span className="text-blaze">.</span>
          </h1>
          <p className="mt-1.5 text-sm text-paper/45">Track spending, by profile.</p>
        </div>

        <Card>
          <div className="mb-5 flex rounded-md border border-line bg-ink p-1">
            {[
              { key: 'login', label: 'Log in' },
              { key: 'signup', label: 'Sign up' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMode(tab.key)}
                className={[
                  'flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                  mode === tab.key ? 'bg-blaze text-white' : 'text-paper/50 hover:text-paper',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Username">
              <Input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={mode === 'login' ? 'Enter your username' : 'Choose a username'}
                maxLength={20}
                required
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? '…' : mode === 'login' ? 'Log in' : 'Create profile'}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-paper/35">
            {mode === 'login' ? (
              <>No account? <button className="text-blaze underline underline-offset-2" onClick={() => setMode('signup')}>Sign up</button> instead.</>
            ) : (
              <>Already have a profile? <button className="text-blaze underline underline-offset-2" onClick={() => setMode('login')}>Log in</button> instead.</>
            )}
          </p>
        </Card>

        <p className="mt-6 text-center text-xs text-paper/25">
          Profiles are identified by username only — there's no password field in the schema,
          so this isn't secure authentication, just a way to pick who you're tracking expenses for.
        </p>
      </div>
    </div>
  );
}
