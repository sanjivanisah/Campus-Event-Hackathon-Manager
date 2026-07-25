import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../Api';

function JoinTeam() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [joining, setJoining] = useState(false);

  const joinTeam = async () => {
    setError('');
    setSuccess('');
    setJoining(true);

    try {
      await api.post(`teams/${teamId}/join/`);
      setSuccess('You joined the team successfully.');
      setTimeout(() => navigate('/events'), 1200);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Could not join this team.');
    } finally {
      setJoining(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    navigate('/');
  };

  return (
    <main className="app-shell">
      <nav className="topbar">
        <strong>Campus Event Manager</strong>
        <div>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/events">Events</Link>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="hero-band compact">
        <div>
          <p className="eyebrow">Team Invite</p>
          <h1>Join Team</h1>
          <p>Use this invite to join your teammate’s event team.</p>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel full-span join-panel">
          <h2>Team Invite #{teamId}</h2>
          <p className="muted">
            Click below to join this team. If you opened this link before logging in,
            the app will bring you back here after login or Google registration.
            You must use a participant account, registration must still be open,
            and the team must have space.
          </p>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="button-row">
            <button onClick={joinTeam} disabled={joining}>
              {joining ? 'Joining...' : 'Join Team'}
            </button>
            <Link to="/events">Back to Events</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default JoinTeam;
