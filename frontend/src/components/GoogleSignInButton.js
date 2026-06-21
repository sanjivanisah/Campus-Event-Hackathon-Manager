import { useEffect, useRef, useState } from 'react';
import api from '../Api';

const GOOGLE_SCRIPT_ID = 'google-identity-services';

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function GoogleSignInButton({ role, college, onSuccess, onError }) {
  const buttonRef = useRef(null);
  const profileRef = useRef({ role, college });
  const handlersRef = useRef({ onSuccess, onError });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    profileRef.current = { role, college };
    handlersRef.current = { onSuccess, onError };
  }, [college, onError, onSuccess, role]);

  useEffect(() => {
    let cancelled = false;
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    if (!clientId) {
      handlersRef.current.onError('Google sign-in is not configured. Add REACT_APP_GOOGLE_CLIENT_ID to frontend/.env.');
      return undefined;
    }

    loadGoogleScript()
      .then(() => {
        if (cancelled) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            try {
              const profile = profileRef.current;
              const res = await api.post('accounts/google/', {
                credential: response.credential,
                role: profile.role,
                college: profile.college,
              });

              localStorage.setItem('token', res.data.access);
              localStorage.setItem('refreshToken', res.data.refresh);
              handlersRef.current.onSuccess(res.data.user);
            } catch (err) {
              const message = err.response?.data?.detail || 'Google sign-in failed.';
              handlersRef.current.onError(message);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: buttonRef.current.offsetWidth,
        });
        setReady(true);
      })
      .catch(() => handlersRef.current.onError('Could not load Google sign-in.'));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="google-auth-button-wrap">
      <div ref={buttonRef} className="google-auth-button" />
      {!ready && <p className="muted">Loading Google sign-in...</p>}
    </div>
  );
}

export default GoogleSignInButton;
