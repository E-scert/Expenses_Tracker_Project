import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import RequireUser from './components/RequireUser.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Users from './pages/Users.jsx';
import Categories from './pages/Categories.jsx';
import Expenses from './pages/Expenses.jsx';
import { UserProvider, useActiveUser } from './context/UserContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

function Shell() {
  const { activeUser } = useActiveUser();
  return (
    <>
      {activeUser && <Navbar />}
      <main>
        <Routes>
          <Route path="/welcome" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<RequireUser><Dashboard /></RequireUser>} />
          <Route path="/users" element={<RequireUser><Users /></RequireUser>} />
          <Route path="/categories" element={<RequireUser><Categories /></RequireUser>} />
          <Route path="/expenses" element={<RequireUser><Expenses /></RequireUser>} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ToastProvider>
        <Shell />
      </ToastProvider>
    </UserProvider>
  );
}