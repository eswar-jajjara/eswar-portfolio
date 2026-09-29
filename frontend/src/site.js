export const initialPortfolio = { summary: null, projects: [], experience: [], certifications: [], endorsements: [], githubProjects: [] };
export const basePath = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');
export const adminPath = `${basePath}/admin`;
export const publicPath = `${basePath}/`;

export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function assetUrl(value) {
  const source = value?.trim();
  if (!source) return '';
  if (/^https?:\/\//i.test(source)) return source;
  if (source.startsWith('/api/public/media/')) {
    return `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}${source}`;
  }
  if (source.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(source)) return '';
  const relative = source.replace(/^\/+/, '').replace(/^(project-cards\/(?:animal-intrusion|camstream|proarena))\.png$/, '$1.webp');
  if (basePath && source.startsWith(`${basePath}/`)) return source;
  return `${import.meta.env.BASE_URL}${relative}`;
}
