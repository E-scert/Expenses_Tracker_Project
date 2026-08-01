import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useActiveUser } from '../context/UserContext.jsx';
import { Card, Button } from '../components/ui.jsx';

export default function Landing() {
  const { activeUser } = useActiveUser();
  const navigate = useNavigate();

  // already logged in — no need to see the landing page again
  useEffect(() => {
    if (activeUser) navigate('/', { replace: true });
  }, [activeUser, navigate]);

  return (
    <div className="flex min-h-[calc(100vh-0px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm animate-riseIn">
        <div className="mb-10 text-center">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blaze shadow-blaze" />
          <h1 className="mt-3 font-display text-3xl font-semibold text-paper">
            LEDGER<span className="text-blaze">.</span>
          </h1>
          <p className="mt-2 text-sm text-paper/45">
            Track what you spend, sorted by category, in seconds.
          </p>
        </div>

        <Card className="flex flex-col gap-3">
          <Button onClick={() => navigate('/login')} className="w-full">
            Log in
          </Button>
          <Button variant="ghost" onClick={() => navigate('/signup')} className="w-full">
            Create a profile
          </Button>
        </Card>

        <p className="mt-6 text-center text-xs text-paper/25">
          Profiles are identified by username only — there's no password field in the schema,
          so this isn't secure authentication, just a way to pick who you're tracking expenses for.
        </p>
      </div>
    </div>
  );
}