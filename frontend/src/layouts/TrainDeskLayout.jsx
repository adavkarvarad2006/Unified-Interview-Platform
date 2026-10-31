import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TrainDeskDashboard from '../modules/traindesk/pages/TrainDeskDashboard';
import '../modules/traindesk/styles/traindesk.css';
import { ArrowLeft, User, ShieldCheck, LogOut, Home } from 'lucide-react';

export default function TrainDeskLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const backUrl = isAdmin ? '/admin' : (user ? '/student' : '/');

  return (
    <div className="traindesk-root">
      {/* Workspace top navigation bar linking back to the Unified Platform */}
      <header className="td-back-bar">
        <Link to={backUrl} title="Return to Unified Platform">
          <ArrowLeft size={16} />
          <span>Back to {isAdmin ? 'Admin Dashboard' : (user ? 'Student Portal' : 'Unified Platform')}</span>
        </Link>
        <span className="td-divider">|</span>
        <Link to="/" title="Home">
          <Home size={14} />
          <span>Home</span>
        </Link>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isAdmin ? <ShieldCheck size={15} color="var(--td-accent)" /> : <User size={15} />}
                <strong>{user.name}</strong>
                <span className="tag" style={{ marginLeft: '4px' }}>{user.role}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--td-bad)'
                }}
                title="Sign Out"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <Link to="/login" style={{ color: 'var(--td-accent)', fontWeight: 500 }}>
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* TrainDesk Workspace Body with original UI layout and styling */}
      <main className="td-body">
        <TrainDeskDashboard />
      </main>
    </div>
  );
}

