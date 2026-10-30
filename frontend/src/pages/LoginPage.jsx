import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LogIn, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  User, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export default function LoginPage({ initialPortal = 'STUDENT' }) {
  const [portalType, setPortalType] = useState(initialPortal); // 'STUDENT' | 'ADMIN'
  
  // Form states
  const [email, setEmail] = useState(initialPortal === 'ADMIN' ? 'parkavi.a@msrit.edu' : '');
  const [password, setPassword] = useState(initialPortal === 'ADMIN' ? 'Password123!' : '');
  
  // Loading & status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  // Switch to Admin Portal
  const switchToAdmin = () => {
    setPortalType('ADMIN');
    setEmail('parkavi.a@msrit.edu');
    setPassword('Password123!');
    setError(null);
    setSuccessMsg(null);
  };

  // Switch to Student Portal
  const switchToStudent = () => {
    setPortalType('STUDENT');
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMsg(null);
  };

  // Navigate according to user role
  const handleAuthSuccess = (userData) => {
    if (userData.role === 'ADMIN' || userData.role === 'COUNSELLOR') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  // Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Demo Logins
  const handleDemo = async (role) => {
    setError(null);
    setLoading(true);
    try {
      const data = await loginAsDemo(role);
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '70px 0 110px' }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <div 
          className="glass-panel"
          style={{
            padding: '38px',
            border: '1px solid var(--border-highlight)',
            background: 'linear-gradient(135deg, rgba(18, 24, 38, 0.98) 0%, rgba(24, 32, 52, 0.95) 100%)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Top Portal Switcher: Student vs Admin */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              padding: '6px',
              background: 'rgba(10, 15, 29, 0.85)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '26px'
            }}
          >
            <button
              type="button"
              onClick={switchToStudent}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: portalType === 'STUDENT' ? 'linear-gradient(135deg, #0284c7, #0369a1)' : 'transparent',
                color: portalType === 'STUDENT' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: portalType === 'STUDENT' ? '0 4px 12px rgba(2, 132, 199, 0.35)' : 'none'
              }}
            >
              <User size={16} />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={switchToAdmin}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: portalType === 'ADMIN' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: portalType === 'ADMIN' ? '#fff' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                boxShadow: portalType === 'ADMIN' ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <ShieldCheck size={16} />
              <span>Admin / Counsellor</span>
            </button>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            {portalType === 'ADMIN' ? (
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.45)'
                }}>
                  <ShieldCheck size={28} color="#fff" />
                </div>
                <h1 style={{ fontSize: '1.85rem', color: '#fff', marginBottom: '6px', letterSpacing: '-0.02em' }}>
                  Admin & Counsellor Login
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  Dr. Parkavi A. Portal — Manage booked appointments, student directory, and sessions schedule
                </p>
              </div>
            ) : (
              <div>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0284c7, #06b6d4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 8px 24px rgba(2, 132, 199, 0.45)'
                }}>
                  <User size={28} color="#fff" />
                </div>
                <h1 style={{ fontSize: '1.85rem', color: '#fff', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  Student Sign In
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Sign in with your email and password to access counselling, placement assessments, and training
                </p>
              </div>
            )}
          </div>

          {/* ADMIN PORTAL SPECIAL CREDENTIALS BOX */}
          {portalType === 'ADMIN' && (
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14), rgba(168, 85, 247, 0.08))',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#a5b4fc" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e0e7ff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Official Admin Credentials
                  </span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                  Verified Access
                </span>
              </div>

              <div style={{ background: 'rgba(10, 15, 30, 0.6)', padding: '12px 14px', borderRadius: '8px', marginBottom: '14px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Admin Email:</span>
                  <code style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: 600 }}>parkavi.a@msrit.edu</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Admin Password:</span>
                  <code style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: 600 }}>Password123!</code>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('parkavi.a@msrit.edu');
                    setPassword('Password123!');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  Auto-Fill Credentials
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemo('ADMIN')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  <LogIn size={14} />
                  Instant 1-Click Login
                </button>
              </div>
            </div>
          )}

          {/* STUDENT PORTAL QUICK DEMO BOX */}
          {portalType === 'STUDENT' && (
            <div 
              style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12), rgba(6, 182, 212, 0.08))',
                border: '1px solid rgba(2, 132, 199, 0.35)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '22px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={15} color="#38bdf8" />
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#e0f2fe', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Demo Student Account
                  </span>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                  1-Click Ready
                </span>
              </div>

              <div style={{ background: 'rgba(10, 15, 30, 0.6)', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email:</span>
                  <code style={{ fontSize: '0.84rem', color: '#38bdf8', fontWeight: 600 }}>emily.watson@gmail.com</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Password:</span>
                  <code style={{ fontSize: '0.84rem', color: '#34d399', fontWeight: 600 }}>Password123!</code>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('emily.watson@gmail.com');
                    setPassword('Password123!');
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', justifyContent: 'center' }}
                >
                  Auto-Fill Student
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemo('STUDENT')}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.78rem', justifyContent: 'center', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
                >
                  <LogIn size={13} />
                  Instant 1-Click Login
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'var(--danger-bg)', color: '#fda4af', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', borderRadius: '8px', marginBottom: '18px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* PASSWORD LOGIN FORM */}
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {portalType === 'ADMIN' ? 'Admin / Counsellor Email' : 'Student Email Address'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portalType === 'ADMIN' ? 'parkavi.a@msrit.edu' : 'you@domain.com'}
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                {portalType === 'ADMIN' ? 'Admin Password' : 'Password'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <KeyRound size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '12px',
                justifyContent: 'center',
                fontSize: '0.95rem',
                background: portalType === 'ADMIN' 
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)' 
                  : 'linear-gradient(135deg, #0284c7, #0369a1)' 
              }}
            >
              <LogIn size={16} />
              <span>
                {loading 
                  ? 'Authenticating...' 
                  : portalType === 'ADMIN' 
                    ? 'Sign In as Admin (Dr. Parkavi)' 
                    : 'Sign In with Password'}
              </span>
            </button>
          </form>

          {/* Footer note */}
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            New to InterviewPrep?{' '}
            <Link to="/register" style={{ color: '#818cf8', fontWeight: 600 }}>
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
