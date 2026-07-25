import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../Api';

function Events() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({});
  const [joinLink, setJoinLink] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    registration_deadline: '',
    submission_deadline: '',
    max_team_size: 4
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    try {
      const meRes = await api.get('accounts/me/');
      setUser(meRes.data);
      fetchEvents();
      fetchTeams(meRes.data);
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

  const fetchTeams = async (currentUser = user) => {
    if (currentUser?.role !== 'PARTICIPANT') {
      return;
    }

    try {
      const res = await api.get('teams/');
      setTeams(res.data);
    } catch (err) {
      setError('Could not load your teams.');
    }
  };

  const getJoinLink = (teamId) => {
    return `${window.location.origin}/join-team/${teamId}`;
  };

  const copyJoinLink = async (teamId) => {
    const link = getJoinLink(teamId);

    try {
      await navigator.clipboard.writeText(link);
      setSuccess('Team join link copied.');
    } catch (err) {
      setSuccess(`Copy this team join link: ${link}`);
    }
  };

  const getTeamIdFromJoinLink = (value) => {
    const trimmedValue = value.trim();

    if (/^\d+$/.test(trimmedValue)) {
      return trimmedValue;
    }

    const match = trimmedValue.match(/\/join-team\/(\d+)\/?$/);

    return match ? match[1] : null;
  };

  const joinTeamFromLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const teamId = getTeamIdFromJoinLink(joinLink);

    if (!teamId) {
      setError('Please paste a valid team join link.');
      return;
    }

    try {
      await api.post(`teams/${teamId}/join/`);
      setJoinLink('');
      setSuccess('You joined the team successfully.');
      fetchEvents();
      fetchTeams();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.error || 'Could not join this team.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await api.post('events/', form);
      setForm({
        title: '',
        description: '',
        registration_deadline: '',
        submission_deadline: '',
        max_team_size: 4
      });
      setSuccess(
        user?.role === 'ADMIN'
          ? 'Event created and approved.'
          : 'Event submitted. It will be visible to participants after admin approval.'
      );
      fetchEvents();
    } catch (err) {
      setError('Could not create event. Please check every field.');
    }
  };

  const approveEvent = async (eventId) => {
    setError('');
    setSuccess('');

    try {
      await api.post(`events/${eventId}/approve/`);
      setSuccess('Event approved successfully.');
      fetchEvents();
    } catch (err) {
      setError('Could not approve event.');
    }
  };

  const createTeam = async (eventId) => {
    setError('');
    setSuccess('');

    try {
      const res = await api.post('teams/create/', {
        event: eventId,
        name: teamForm[eventId] || ''
      });
      const link = getJoinLink(res.data.id);
      setTeamForm({ ...teamForm, [eventId]: '' });
      setSuccess(`Team created. Share this join link: ${link}`);
      fetchEvents();
      fetchTeams();
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

        {user?.role === 'PARTICIPANT' && (
          <form className="panel full-span" onSubmit={joinTeamFromLink}>
            <div className="section-title">
              <h2>Join Team by Link</h2>
            </div>
            <p className="muted">
              Paste the invite link shared by your teammate to join their team.
            </p>
            <div className="inline-form">
              <input
                placeholder="Paste link, e.g. http://localhost:3000/join-team/5"
                value={joinLink}
                onChange={(e) => setJoinLink(e.target.value)}
              />
              <button>Join Team</button>
            </div>
          </form>
        )}

        {user?.role === 'PARTICIPANT' && teams.length > 0 && (
          <section className="panel full-span">
            <div className="section-title">
              <h2>My Teams</h2>
              <span>{teams.length} total</span>
            </div>

            <div className="team-card-grid">
              {teams.map((team) => (
                <article className="event-card" key={team.id}>
                  <div className="card-heading">
                    <h3>{team.name}</h3>
                    <span className="status open">
                      {team.member_count} members
                    </span>
                  </div>
                  <p>{team.event_title}</p>
                  <label>
                    Join Link
                    <input readOnly value={getJoinLink(team.id)} />
                  </label>
                  <div className="button-row">
                    <button onClick={() => copyJoinLink(team.id)}>
                      Copy Join Link
                    </button>
                    <Link to={`/join-team/${team.id}`}>Open Link</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className={user?.role === 'PARTICIPANT' ? 'panel full-span' : 'panel'}>
          <div className="section-title">
            <h2>Available Events</h2>
            <span>{events.length} total</span>
          </div>
          {loading && <p className="muted">Loading events...</p>}
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          {!loading && !error && events.length === 0 && (
            <p className="muted">No events yet. Create the first one.</p>
          )}

          <div className="event-list">
            {events.map((event) => (
              <article className="event-card" key={event.id}>
                <div className="card-heading">
                  <h3>{event.title}</h3>
                  <span
                    className={
                      event.approval_status === 'APPROVED'
                        ? event.registration_open
                          ? 'status open'
                          : 'status closed'
                        : 'status pending'
                    }
                  >
                    {event.approval_status === 'APPROVED'
                      ? event.registration_open
                        ? 'Open'
                        : 'Closed'
                      : 'Pending approval'}
                  </span>
                </div>
                <p>{event.description}</p>
                <dl>
                  <div>
                    <dt>Approval</dt>
                    <dd>{event.approval_status}</dd>
                  </div>
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

                {user?.role === 'ADMIN' && event.approval_status === 'PENDING' && (
                  <button onClick={() => approveEvent(event.id)}>
                    Approve Event
                  </button>
                )}

                {user?.role === 'PARTICIPANT'
                  && event.approval_status === 'APPROVED'
                  && event.registration_open && (
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
