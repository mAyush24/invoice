import { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const normUser = username.trim().toLowerCase();
    
    if (!normUser || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (normUser === 'admin' && password === 'admin123') {
      onLogin({ username: 'Admin', role: 'admin' });
    } else if (normUser === 'staff' && password === 'staff123') {
      onLogin({ username: 'Staff Member', role: 'staff' });
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            Stock<span>Master</span>
          </div>
          <p className="login-subtitle">Sign in to manage your inventory and billing</p>
        </div>

        {error && (
          <div className="badge badge-red" style={{ width: '100%', borderRadius: '8px', padding: '12px', marginBottom: '20px', display: 'block', textAlign: 'center', fontFamily: 'inherit', fontSize: '13px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-icon-wrapper">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%', gap: '8px' }}>
            <LogIn size={18} /> Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: 'var(--muted)' }}>
          © {new Date().getFullYear()} StockMaster. All rights reserved.
        </div>
      </div>
    </div>
  );
}
