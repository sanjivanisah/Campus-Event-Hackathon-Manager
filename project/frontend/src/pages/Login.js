import { useState } from 'react';
import api from '../Api';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [googleRole, setGoogleRole] = useState('PARTICIPANT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('token/', form);

      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('accounts/google-auth/', {
        token: credentialResponse.credential,
        role: googleRole
      });

      localStorage.setItem('token', res.data.access);
      localStorage.setItem('refreshToken', res.data.refresh);

      navigate('/dashboard');
    } catch (err) {
      setError('Google authentication failed. Please try again.');
      console.error('Google auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed. Please try again.');
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Campus Event Manager</p>
        <h1>Login</h1>
        <p className="muted">Manage events, teams, and project submissions.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">
          <p className="muted">Or continue with:</p>
          <label>
            Google role
            <select
              value={googleRole}
              onChange={(e) => setGoogleRole(e.target.value)}
            >
              <option value="PARTICIPANT">Participant</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>

        <p className="muted">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
