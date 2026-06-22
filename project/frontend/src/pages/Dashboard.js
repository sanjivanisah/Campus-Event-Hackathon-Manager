import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Api';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [meRes, eventsRes, teamsRes, submissionsRes] = await Promise.all([
        api.get('accounts/me/'),
        api.get('events/'),
        api.get('teams/'),
        api.get('submissions/')
      ]);

      setUser(meRes.data);
      setEvents(eventsRes.data);
      setTeams(teamsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/');
      } else {
        setError('Could not load dashboard data.');
      }
    }
  };

  const nextDeadlines = useMemo(() => {
    return events
      .flatMap((event) => [
        {
          id: `${event.id}-registration`,
          title: event.title,
          label: 'Registration closes',
          date: event.registration_deadline
        },
        {
          id: `${event.id}-submission`,
          title: event.title,
          label: 'Submission closes',
          date: event.submission_deadline
        }
      ])
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4);
  }, [events]);

  const activeRegistrations = events.filter((event) => event.registration_open).length;

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
          <Link to="/events">Events</Link>
          <Link to="/submissions">Submissions</Link>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="hero-band">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome back{user ? `, ${user.username}` : ''}</h1>
          <p>Track registration pressure, upcoming deadlines, team activity, and project submissions from one clean workspace.</p>
        </div>
        <span className="role-pill">{user?.role || 'Loading'}</span>
      </section>

      {error && <p className="page-alert">{error}</p>}

      <section className="metric-grid">
        <article className="metric-card">
          <span>Events</span>
          <strong>{events.length}</strong>
          <small>{activeRegistrations} accepting registrations</small>
        </article>
        <article className="metric-card">
          <span>Teams</span>
          <strong>{teams.length}</strong>
          <small>{user?.role === 'PARTICIPANT' ? 'your teams' : 'created teams'}</small>
        </article>
        <article className="metric-card">
          <span>Submissions</span>
          <strong>{submissions.length}</strong>
          <small>project portals received</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="section-title">
            <h2>Event Timeline</h2>
            <Link to="/events">Manage events</Link>
          </div>

          <div className="timeline-list">
            {nextDeadlines.length === 0 && <p className="muted">No deadlines scheduled yet.</p>}
            {nextDeadlines.map((item) => (
              <article className="timeline-item" key={item.id}>
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <Link className="action-card" to="/events">
          <span>Events</span>
          <strong>Host events or join as a team</strong>
          <p>Role-aware event controls keep organizers and participants in the right workflow.</p>
        </Link>

        <Link className="action-card accent" to="/submissions">
          <span>Submissions</span>
          <strong>Upload project links</strong>
          <p>Team leaders can submit GitHub and demo URLs before the event deadline.</p>
        </Link>
      </section>
    </main>
  );
}

export default Dashboard;
