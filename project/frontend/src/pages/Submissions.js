import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Api';

function Submissions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState({
    team: '',
    github_url: '',
    demo_url: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const [meRes, teamRes, submissionRes] = await Promise.all([
        api.get('accounts/me/'),
        api.get('teams/'),
        api.get('submissions/')
      ]);
      setUser(meRes.data);
      setTeams(teamRes.data);
      setSubmissions(submissionRes.data);
    } catch (err) {
      navigate('/');
    }
  };

  const submitProject = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('submissions/', form);
      setForm({
        team: '',
        github_url: '',
        demo_url: '',
        description: ''
      });
      setSuccess('Project submitted successfully.');
      loadPage();
    } catch (err) {
      const data = err.response?.data;
      const message = data
        ? Object.values(data).flat().join(' ')
        : 'Could not submit project.';
      setError(message);
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
          <p className="eyebrow">Submission Portal</p>
          <h1>Project Submissions</h1>
          <p>Submit GitHub repositories, demos, and project descriptions tied to your registered team.</p>
        </div>
        <span className="role-pill">{user?.role || 'Loading'}</span>
      </section>

      <section className="content-grid">
        <form className="panel" onSubmit={submitProject}>
          <h2>Submit Project</h2>

          {user?.role !== 'PARTICIPANT' && (
            <p className="muted">Organizers can review submissions here. Participant team leaders create new submissions.</p>
          )}

          <label>
            Team
            <select
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
              disabled={user?.role !== 'PARTICIPANT'}
            >
              <option value="">Select team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.event_title}
                </option>
              ))}
            </select>
          </label>

          <label>
            GitHub URL
            <input
              value={form.github_url}
              onChange={(e) => setForm({ ...form, github_url: e.target.value })}
              disabled={user?.role !== 'PARTICIPANT'}
            />
          </label>

          <label>
            Demo URL
            <input
              value={form.demo_url}
              onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
              disabled={user?.role !== 'PARTICIPANT'}
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              disabled={user?.role !== 'PARTICIPANT'}
            />
          </label>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          {user?.role === 'PARTICIPANT' && <button>Submit Project</button>}
        </form>

        <section className="panel">
          <div className="section-title">
            <h2>Recent Submissions</h2>
            <span>{submissions.length} total</span>
          </div>

          <div className="event-list">
            {submissions.length === 0 && <p className="muted">No submissions yet.</p>}
            {submissions.map((submission) => (
              <article className="event-card" key={submission.id}>
                <div className="card-heading">
                  <h3>{submission.team_name}</h3>
                  <span className="status open">Submitted</span>
                </div>
                <p>{submission.description}</p>
                <dl>
                  <div>
                    <dt>Event</dt>
                    <dd>{submission.event_title}</dd>
                  </div>
                  <div>
                    <dt>GitHub</dt>
                    <dd><a href={submission.github_url}>Open repo</a></dd>
                  </div>
                  {submission.demo_url && (
                    <div>
                      <dt>Demo</dt>
                      <dd><a href={submission.demo_url}>View demo</a></dd>
                    </div>
                  )}
                </dl>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Submissions;
