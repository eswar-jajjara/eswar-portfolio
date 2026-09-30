const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const headers = { ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, signal: options.signal || AbortSignal.timeout(90000) });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const failure = new Error(error.message || `Request failed (${response.status})`);
    failure.status = response.status;
    failure.fields = error.fields;
    throw failure;
  }
  return response.status === 204 ? null : response.json();
}

export const publicApi = {
  getSnapshot: async (signal) => {
    if (!import.meta.env.PROD) return null;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}portfolio-snapshot.json`, { signal });
      return response.ok ? await response.json() : null;
    } catch { return null; }
  },
  getPortfolio: async (signal) => {
    const data = await request('/api/public/portfolio', { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(90000)]) : undefined });
    return { ...data, githubProjects: [] };
  },
  // GitHub proof is deliberately fetched after the main portfolio content is
  // painted. A slow third-party API must never delay a recruiter's first view.
  getGithubProjects: (signal) => request('/api/public/github-projects', { signal }).catch(() => []),
};

function adminHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export const adminApi = {
  upload: async (token, file) => {
    const body = new FormData();
    body.append('file', file);
    return request('/api/admin/media', { method: 'POST', headers: adminHeaders(token), body });
  },
  login: (credentials) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  googleLogin: (credential) => request('/api/auth/google', { method: 'POST', body: JSON.stringify({ credential }) }),
  getAll: (token) => Promise.all([
    request('/api/admin/summary', { headers: adminHeaders(token) }).catch((error) => {
      if (error.status === 404) return null;
      throw error;
    }),
    request('/api/admin/projects', { headers: adminHeaders(token) }),
    request('/api/admin/experience', { headers: adminHeaders(token) }),
    request('/api/admin/certifications', { headers: adminHeaders(token) }),
    request('/api/admin/endorsements', { headers: adminHeaders(token) }).catch((error) => {
      if (error.status === 404) return [];
      throw error;
    }),
  ]).then(([summary, projects, experience, certifications, endorsements]) => ({ summary, projects, experience, certifications, endorsements })),
  createSummary: (token, payload) => request('/api/admin/summary', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  saveSummary: (token, payload) => request('/api/admin/summary', { method: 'PUT', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  deleteSummary: (token) => request('/api/admin/summary', { method: 'DELETE', headers: adminHeaders(token) }),
  createProject: (token, payload) => request('/api/admin/projects', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  updateProject: (token, id, payload) => request(`/api/admin/projects/${id}`, { method: 'PUT', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  deleteProject: (token, id) => request(`/api/admin/projects/${id}`, { method: 'DELETE', headers: adminHeaders(token) }),
  createExperience: (token, payload) => request('/api/admin/experience', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  updateExperience: (token, id, payload) => request(`/api/admin/experience/${id}`, { method: 'PUT', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  deleteExperience: (token, id) => request(`/api/admin/experience/${id}`, { method: 'DELETE', headers: adminHeaders(token) }),
  createCertification: (token, payload) => request('/api/admin/certifications', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  updateCertification: (token, id, payload) => request(`/api/admin/certifications/${id}`, { method: 'PUT', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  deleteCertification: (token, id) => request(`/api/admin/certifications/${id}`, { method: 'DELETE', headers: adminHeaders(token) }),
  createEndorsement: (token, payload) => request('/api/admin/endorsements', { method: 'POST', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  updateEndorsement: (token, id, payload) => request(`/api/admin/endorsements/${id}`, { method: 'PUT', headers: adminHeaders(token), body: JSON.stringify(payload) }),
  deleteEndorsement: (token, id) => request(`/api/admin/endorsements/${id}`, { method: 'DELETE', headers: adminHeaders(token) }),
};
