import { useEffect, useRef, useState } from 'react';
import { publicApi } from './api/client';
import { initialPortfolio } from './site';

const cacheKey = `portfolio-public-v2:${import.meta.env.VITE_API_BASE_URL || 'local'}`;
function readCache() {
  try {
    const value = JSON.parse(localStorage.getItem(cacheKey));
    if (value?.data?.summary && Date.now() - value.savedAt < 86400000) return value.data;
  } catch { /* Storage may be disabled. Network loading still works. */ }
  return initialPortfolio;
}
export function usePortfolio(enabled) {
  const [portfolio, setPortfolio] = useState(readCache);
  const [loading, setLoading] = useState(!portfolio.summary);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const hasContent = useRef(Boolean(portfolio.summary));
  useEffect(() => {
    if (!enabled) return undefined;
    const controller = new AbortController();
    let pending = false;
    let receivedLiveData = false;
    if (!hasContent.current) publicApi.getSnapshot(controller.signal).then((data) => {
      if (data?.summary && !receivedLiveData && !controller.signal.aborted) {
        hasContent.current = true;
        setPortfolio({ ...data, githubProjects: [] });
        setError('');
        setLoading(false);
      }
    });
    async function refresh() {
      if (pending || controller.signal.aborted) return;
      pending = true;
      try {
        const data = await publicApi.getPortfolio(controller.signal);
        if (controller.signal.aborted) return;
        receivedLiveData = true;
        hasContent.current = Boolean(data.summary);
        setPortfolio(data);
        setError('');
        try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data })); } catch {}
        publicApi.getGithubProjects(controller.signal).then((githubProjects) => {
          if (!controller.signal.aborted) setPortfolio((current) => ({ ...current, githubProjects }));
        });
      } catch (failure) {
        if (!controller.signal.aborted) setError(hasContent.current ? '' : failure.message);
      } finally {
        pending = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    if (!hasContent.current) setLoading(true);
    refresh();
    const visibleRefresh = () => { if (!document.hidden) refresh(); };
    const onStorage = (event) => { if (event.key === 'portfolio-content-updated') visibleRefresh(); };
    const timer = window.setInterval(visibleRefresh, 60000);
    window.addEventListener('focus', visibleRefresh);
    window.addEventListener('storage', onStorage);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', visibleRefresh);
      window.removeEventListener('storage', onStorage);
    };
  }, [enabled, revision]);
  return { portfolio, loading, error, reload: () => setRevision((value) => value + 1) };
}
