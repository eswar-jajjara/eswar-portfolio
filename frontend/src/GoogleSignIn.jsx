import { useEffect, useRef, useState } from 'react';

export const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

export default function GoogleSignIn({ onCredential }) {
  const button = useRef(null);
  const callback = useRef(onCredential);
  const [state, setState] = useState('loading');
  callback.current = onCredential;

  useEffect(() => {
    if (!googleClientId) return undefined;
    let cancelled = false;
    let script = document.querySelector('script[data-portfolio-google-signin]');
    const render = () => {
      if (cancelled || !button.current || !window.google?.accounts?.id) return;
      button.current.replaceChildren();
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response?.credential) callback.current(response.credential);
            else setState('error');
          },
          auto_select: false,
        });
        window.google.accounts.id.renderButton(button.current, {
          theme: 'outline', size: 'large', shape: 'rectangular', text: 'signin_with',
          width: Math.min(370, Math.max(200, button.current.clientWidth)),
        });
        setState('ready');
      } catch { setState('error'); }
    };
    const failed = () => { script.remove(); if (!cancelled) setState('error'); };
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.dataset.portfolioGoogleSignin = '';
      document.head.appendChild(script);
    }
    script.addEventListener('load', render);
    script.addEventListener('error', failed);
    if (window.google?.accounts?.id) render();
    return () => {
      cancelled = true;
      script.removeEventListener('load', render);
      script.removeEventListener('error', failed);
    };
  }, []);

  if (!googleClientId) return null;
  return <div className="google-login"><div ref={button} className="google-login-button" aria-label="Sign in with Google" />{state === 'loading' && <small role="status">Loading Google sign-in…</small>}{state === 'error' && <small role="alert">Google sign-in is unavailable. You can still use your password below.</small>}</div>;
}
