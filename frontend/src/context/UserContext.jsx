import React, { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext(null);
const STORAGE_KEY = 'ledger.activeUser';

export function UserProvider({ children }) {
  const [activeUser, setActiveUserState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (activeUser) localStorage.setItem(STORAGE_KEY, JSON.stringify(activeUser));
    else localStorage.removeItem(STORAGE_KEY);
  }, [activeUser]);

  const setActiveUser = (user) => setActiveUserState(user);
  const clearActiveUser = () => setActiveUserState(null);

  return (
    <UserContext.Provider value={{ activeUser, setActiveUser, clearActiveUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useActiveUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useActiveUser must be used within a UserProvider');
  return ctx;
}
