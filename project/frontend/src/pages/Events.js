import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Api';

function Events() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [teamForm, setTeamForm] = useState({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    registration_deadline: '',
    submission_deadline: '',
    max_team_size: 4
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const meRes = await api.get('accounts/me/');
      setUser(meRes.data);
      fetchEvents();
    } catch (err) {
      navigate('/');
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('events/');
      setEvents(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please login before viewing events.');
      } else {
        setError('Could not load events.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('events/', form);
      setForm({
        title: '',
        description: '',
        registration_deadline: '',
        submission_deadline: '',
        max_team_size: 4
      });
      fetchEvents();
    } catch (err) {
      setError('Could not create event. Please check every field.');
    }
  };

  const createTeam = async (eventId) => {
    setError('');

    try {
      await api.post('teams/create/', {
        event: eventId,
        name: teamForm[eventId] || ''
      });
      setTeamForm({ ...teamForm, [eventId]: '' });
      fetchEvents();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Could not create team for this event.');
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
          <Link to="/submissions">Submissions</Link>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="hero-band compact">
        <div>
          <p className="eyebrow">Events</p>
          <h1>Campus Events</h1>
          <p>Create hackathons, watch deadlines, and let participants form teams without manual coordination.</p>
        </div>
        <span className="role-pill">{user?.role || 'Loading'}</span>
      </section>

      <section className="content-grid">
        {user?.role !== 'PARTICIPANT' && (
          <form className="panel" onSubmit={handleSubmit}>
            <h2>Create Event</h2>

            <label>
              Title
              <input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>

            <label>
              Registration Deadline
              <input
                type="datetime-local"
                value={form.registration_deadline}
                onChange={(e) =>
                  setForm({ ...form, registration_deadline: e.target.value })
                }
              />
            </label>

            <label>
              Submission Deadline
              <input
                type="datetime-local"
                value={form.submission_deadline}
                onChange={(e) =>
                  setForm({ ...form, submission_deadline: e.target.value })
                }
              />
            </label>

            <label>
              Max Team Size
              <input
                type="number"
                min="1"
                value={form.max_team_size}
                onChange={(e) =>
                  setForm({ ...form, max_team_size: Number(e.target.value) })
                }
              />
            </label>

            <button>Create Event</button>
          </form>
        )}

        <section className={user?.role === 'PARTICIPANT' ? 'panel full-span' : 'panel'}>
          <div className="section-title">
            <h2>Available Events</h2>
            <span>{events.length} total</span>
          </div>
          {loading && <p className="muted">Loading events...</p>}
          {error && <p className="error">{error}</p>}

          {!loading && !error && events.length === 0 && (
            <p className="muted">No events yet. Create the first one.</p>
          )}

          <div className="event-list">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="card-heading">
                  <h3>{event.title}</h3>
                  <span className={event.registration_open ? 'status open' : 'status closed'}>
                    {event.registration_open ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p>{event.description}</p>
                <dl>
                  <div>
                    <dt>Organizer</dt>
                    <dd>{event.organizer_name || 'Unknown'}</dd>
                  </div>
                  <div>
                    <dt>Team Size</dt>
                    <dd>{event.max_team_size}</dd>
                  </div>
                  <div>
                    <dt>Teams</dt>
                    <dd>{event.team_count}</dd>
                  </div>
                  <div>
                    <dt>Submissions</dt>
                    <dd>{event.submission_count}</dd>
                  </div>
                </dl>

                {user?.role === 'PARTICIPANT' && event.registration_open && (
                  <div className="inline-form">
                    <input
                      placeholder="Team name"
                      value={teamForm[event.id] || ''}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, [event.id]: e.target.value })
                      }
                    />
                    <button onClick={() => createTeam(event.id)}>Create Team</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default Events;
