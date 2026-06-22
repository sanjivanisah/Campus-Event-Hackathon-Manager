import { useState } from 'react';
import api from '../Api';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'PARTICIPANT',
    college: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('accounts/register/', form);
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      const message = data
        ? Object.values(data).flat().join(' ')
        : 'Registration failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-panel wide">
        <p className="eyebrow">Campus Event Manager</p>
        <h1>Create Account</h1>

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
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
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

          <label>
            Role
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value })
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
              value={form.college}
              onChange={(e) =>
                setForm({ ...form, college: e.target.value })
              }
            />
          </label>

          {error && <p className="error">{error}</p>}

          <button disabled={loading}>
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <p className="muted">
          Already registered? <Link to="/">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
