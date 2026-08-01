import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useActiveUser } from '../context/UserContext.jsx';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/expenses', label: 'Expenses' },
  { to: '/categories', label: 'Categories' },
  { to: '/users', label: 'Profile' },
];

export default function Navbar() {
  const { activeUser, clearActiveUser } = useActiveUser();
  const navigate = useNavigate();

  function handleLogout() {
    clearActiveUser();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-blaze shadow-blaze" />
          <span className="font-display text-lg font-semibold tracking-tight text-paper">
            LEDGER<span className="text-blaze">.</span>
          </span>
        </div>

        <nav className="hidden gap-1 sm:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                [
                  'rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-blaze/15 text-white'
                    : 'text-paper/60 hover:text-paper hover:bg-panel',
                ].join(' ')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-paper/80">
              {activeUser.user_name} <span className="text-paper/40"></span>
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-full border border-line px-3 py-1.5 text-xs text-paper/50 transition-colors hover:border-blaze/60 hover:text-white"
          >
            Log out
          </button>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex gap-1 overflow-x-auto border-t border-line/70 px-4 py-2 sm:hidden">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              [
                'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium',
                isActive ? 'bg-blaze/15 text-white' : 'text-paper/60',
              ].join(' ')
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
