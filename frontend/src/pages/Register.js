import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../components/GoogleSignInButton';

function Register() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    role: 'PARTICIPANT',
    college: ''
  });
  const [error, setError] = useState('');

  return (
    <main className="auth-shell">
      <section className="auth-panel wide">
        <p className="eyebrow">Campus Event Manager</p>
        <h1>Create Account With Google</h1>

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
          Already registered? <Link to="/">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
