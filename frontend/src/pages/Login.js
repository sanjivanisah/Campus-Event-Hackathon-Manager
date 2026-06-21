import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';

function Login() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    role: 'PARTICIPANT',
    college: ''
  });
  const [error, setError] = useState('');

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Campus Event Manager</p>
        <h1>Sign in with Google</h1>
        <p className="muted">Use your Google account to manage events, teams, and project submissions.</p>

        <div className="auth-options">
          <label>
            Role
            <select
              value={profile.role}
              onChange={(e) =>
                setProfile({ ...profile, role: e.target.value })
              }
            >
              <option value="PARTICIPANT">Participant</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>

          <label>
            College
            <input
              value={profile.college}
              onChange={(e) =>
                setProfile({ ...profile, college: e.target.value })
              }
            />
          </label>

          {error && <p className="error">{error}</p>}

          <GoogleSignInButton
            role={profile.role}
            college={profile.college}
            onSuccess={() => navigate('/dashboard')}
            onError={setError}
          />
        </div>

        <p className="muted">
          New here? <Link to="/register">Create an account with Google</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
