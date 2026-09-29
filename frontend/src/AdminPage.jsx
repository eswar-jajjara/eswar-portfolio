import { createContext, useContext, useEffect, useState } from 'react';
import { adminApi } from './api/client';
import { initialPortfolio, publicPath, navigate, assetUrl } from './site';

const emptyProject = { title: '', description: '', techStack: '', link: '', imageUrl: '', impactMetrics: '', sortOrder: 0, featured: true };
const emptyExperience = { role: '', company: '', startDate: '', endDate: '', description: '', sortOrder: 0 };
const emptyCertification = { name: '', issuer: '', issuedDate: '', link: '', sortOrder: 0 };
const emptyEndorsement = { name: '', role: '', quote: '', link: '', sortOrder: 0 };

const AdminToken = createContext('');
function MediaUpload({ value, onChange, accept, disabled }) {
  const token = useContext(AdminToken);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  async function upload(event) {
    const chosen = event.target.files?.[0];
    if (!chosen) return;
    if (chosen.size > 5 * 1024 * 1024) { setMessage('Choose a file smaller than 5 MB.'); event.target.value = ''; return; }
    setUploading(true);
    setMessage('');
    try {
      let file = chosen;
      if (chosen.type.startsWith('image/') && chosen.type !== 'image/svg+xml') {
        const bitmap = await createImageBitmap(chosen);
        const scale = Math.min(1, 1440 / bitmap.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', .82));
        if (blob) file = new File([blob], chosen.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
      }
      const result = await adminApi.upload(token, file);
      onChange(result.url);
      setMessage('Uploaded. Save this entry to publish the file.');
    } catch (error) { setMessage(error.message || 'Upload failed. Please try again.'); }
    finally { setUploading(false); event.target.value = ''; }
  }
  return <span className="media-upload"><input type="file" accept={accept} aria-label="Upload a file" disabled={disabled || uploading} onChange={upload} /><small>{uploading ? 'Uploading…' : 'PDF, PNG, JPEG or WebP · up to 5 MB. Uploads are public when linked.'}</small>{message && <small role="status">{message}</small>}{value && <a href={assetUrl(value)} target="_blank" rel="noreferrer">Open current file ↗</a>}</span>;
}

function Field({ id, label, value, onChange, onBlur, multiline = false, type = 'text', required = true, placeholder, disabled = false, autoComplete, options, error, helpText, uploadAccept }) {
  const describedBy = [helpText && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const props = { id, value: value ?? '', onChange: (event) => onChange(event.target.value), onBlur, required, placeholder, disabled, autoComplete, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy };
  return <label className={`field ${error ? 'has-error' : ''}`}><span>{label}{required === false && <small>Optional</small>}</span>{multiline ? <textarea {...props} rows="4" /> : options ? <select {...props}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input {...props} type={type} />}{uploadAccept && <MediaUpload value={value} onChange={onChange} accept={uploadAccept} disabled={disabled} />}{helpText && <small id={`${id}-help`} className="field-help">{helpText}</small>}{error && <span id={`${id}-error`} className="field-error">{error}</span>}</label>;
}

function Login({ onLogin, error, busy }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  return <main className="admin-login"><div className="login-panel"><button className="back-button" type="button" onClick={() => navigate(publicPath)}>← Public portfolio</button><p className="eyebrow">CMS ACCESS</p><h1>Admin sign-in</h1><p>Manage the public portfolio without rebuilding the site.</p><form onSubmit={(event) => { event.preventDefault(); onLogin({ username, password }); }}><Field label="Username" value={username} onChange={setUsername} autoComplete="username" /><Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" />{error && <p className="form-error" role="alert">{error}</p>}<button className="button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div></main>;
}

function EditorCard({ title, children }) { return <section className="editor-card" id={`cms-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`}><h2>{title}</h2>{children}</section>; }

function fieldId(title, fieldName, recordKey = '') {
  return `field-${`${title}-${recordKey}-${fieldName}`.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`;
}

function validationMessage(field, value) {
  const normalized = typeof value === 'string' ? value.trim() : value;
  const empty = normalized === '' || normalized === null || normalized === undefined;
  if (field.required !== false && empty) return `${field.label} is required.`;
  if (empty) return '';
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return 'Enter a valid email address.';
  if (field.type === 'url') {
    if (String(normalized).startsWith('//')) return 'Use an https:// URL or a local file path.';
    try {
      const parsed = new URL(normalized, window.location.origin);
      if (!['https:', 'http:'].includes(parsed.protocol)) return 'Use an https:// URL or a local file path.';
      if (!/^(https?:\/\/|\/?(?:api\/public\/media|project-cards)\/|\/)/i.test(normalized)) return 'Use a full https:// URL or a path starting with /.';
    } catch { return 'Enter a valid URL.'; }
  }
  if (field.type === 'number' && !Number.isFinite(Number(normalized))) return 'Enter a valid number.';
  if (field.options && !field.options.some((option) => option.value === normalized)) return `Choose a valid ${field.label.toLowerCase()}.`;
  return '';
}

function RecordEditor({ title, record, fields, onSave, onDelete, saveLabel = 'Save', busy = false }) {
  const [draft, setDraft] = useState(record);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const recordKey = record.id || title;
  useEffect(() => { setDraft(record); setProcessing(false); setErrors({}); }, [record]);
  const disabled = busy || processing;
  const updateField = (field, value) => {
    const nextValue = field.type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setDraft((previous) => ({ ...previous, [field.name]: nextValue }));
    setErrors((previous) => {
      if (!previous[field.name]) return previous;
      const nextMessage = validationMessage(field, nextValue);
      if (nextMessage) return { ...previous, [field.name]: nextMessage };
      const { [field.name]: ignored, ...remaining } = previous;
      return remaining;
    });
  };
  const validate = () => Object.fromEntries(fields.map((field) => [field.name, validationMessage(field, draft[field.name])]).filter(([, message]) => message));
  const submit = async (event) => {
    event.preventDefault();
    if (disabled) return;
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstInvalid = fields.find((field) => nextErrors[field.name]);
      document.getElementById(fieldId(title, firstInvalid.name, recordKey))?.focus();
      return;
    }
    setProcessing(true);
    try { await onSave(draft); } finally { setProcessing(false); }
  };
  const remove = async () => {
    if (disabled || !onDelete) return;
    setProcessing(true);
    try { await onDelete(); } finally { setProcessing(false); }
  };
  return <form className="record-editor" onSubmit={submit} noValidate aria-busy={disabled}><div className="record-editor-title"><h3>{title}</h3>{onDelete && <button className="danger-link" type="button" disabled={disabled} onClick={remove}>Delete</button>}</div>{Object.keys(errors).length > 0 && <p className="form-error form-validation-summary" role="alert">Check the highlighted fields before saving.</p>}<div className="form-grid">{fields.map((field) => <Field key={field.name} id={fieldId(title, field.name, recordKey)} label={field.label} type={field.type || 'text'} multiline={field.multiline} required={field.required !== false} disabled={disabled} value={draft[field.name]} placeholder={field.placeholder} options={field.options} helpText={field.helpText} uploadAccept={field.uploadAccept} error={errors[field.name]} onBlur={() => setErrors((previous) => {
    const nextMessage = validationMessage(field, draft[field.name]);
    if (nextMessage) return { ...previous, [field.name]: nextMessage };
    const { [field.name]: ignored, ...remaining } = previous;
    return remaining;
  })} onChange={(value) => updateField(field, value)} />)}</div>{Object.prototype.hasOwnProperty.call(draft, 'featured') && <label className="toggle-field"><input type="checkbox" disabled={disabled} checked={Boolean(draft.featured)} onChange={(event) => setDraft((previous) => ({ ...previous, featured: event.target.checked }))} /> Featured project</label>}<button className="button secondary" type="submit" disabled={disabled}>{processing ? 'Saving…' : saveLabel}</button></form>;
}

function CollectionManager({ title, items, empty, fields, label, create, update, remove, busy }) {
  const [creating, setCreating] = useState(false);
  return <EditorCard title={title}><div className="collection-stack">{items.map((item) => <details className="record-disclosure" key={item.id}><summary>{item.title || item.name || item.role}</summary><RecordEditor title={item.title || item.role || item.name} record={item} fields={fields} busy={busy} onSave={(draft) => update(item.id, draft)} onDelete={() => remove(item.id)} /></details>)}{creating ? <RecordEditor title={'New ' + label} record={empty} fields={fields} busy={busy} onSave={async (draft) => { const created = await create(draft); if (created) setCreating(false); return created; }} saveLabel={'Add ' + label} /> : <button className="add-button" type="button" disabled={busy} onClick={() => setCreating(true)}>+ Add {label}</button>}</div></EditorCard>;
}

function isUnauthorized(error) {
  return error?.status === 401 || error?.status === 403;
}

function AdminDashboard({ token, onLogout }) {
  const [data, setData] = useState(initialPortfolio);
  const [status, setStatus] = useState('Loading content…');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => { try { setError(''); setStatus('Loading content…'); setData(await adminApi.getAll(token)); setStatus(''); return true; } catch (err) { setError(err.message); setStatus(''); if (isUnauthorized(err)) onLogout(); return false; } };
  useEffect(() => { load(); }, []);
  const save = async (operation) => { if (busy) return false; try { setError(''); setStatus('Saving…'); setBusy(true); await operation(); try { localStorage.setItem('portfolio-content-updated', String(Date.now())); } catch {} const loaded = await load(); if (loaded) setStatus('Saved. Your changes are live.'); return loaded; } catch (err) { setError(err.message); setStatus(''); if (isUnauthorized(err)) onLogout(); return false; } finally { setBusy(false); } };
  const projectFields = [{ name: 'title', label: 'Title' }, { name: 'description', label: 'Description', multiline: true }, { name: 'techStack', label: 'Tech stack (comma-separated)' }, { name: 'impactMetrics', label: 'Impact metrics', multiline: true, required: false, placeholder: '40% less latency | 10k+ frames/sec', helpText: 'Add up to three proof points, separated with | or ;.' }, { name: 'link', label: 'Project link', type: 'url', required: false }, { name: 'imageUrl', label: 'Project image', type: 'url', uploadAccept: 'image/png,image/jpeg,image/webp', required: false, helpText: 'Use a full image URL or a site-relative path such as /project-cards/example.webp.' }, { name: 'sortOrder', label: 'Sort order', type: 'number' }];
  const experienceFields = [{ name: 'role', label: 'Role' }, { name: 'company', label: 'Company' }, { name: 'startDate', label: 'Start date', placeholder: 'Jan 2025' }, { name: 'endDate', label: 'End date', placeholder: 'Present', required: false }, { name: 'description', label: 'Description', multiline: true }, { name: 'sortOrder', label: 'Sort order', type: 'number' }];
  const certificationFields = [{ name: 'name', label: 'Certification name' }, { name: 'issuer', label: 'Issuer' }, { name: 'issuedDate', label: 'Issue date', placeholder: '2025' }, { name: 'link', label: 'Credential link or certificate file', type: 'url', uploadAccept: 'application/pdf,image/png,image/jpeg,image/webp', required: false }, { name: 'sortOrder', label: 'Sort order', type: 'number' }];
  const endorsementFields = [{ name: 'name', label: 'Name' }, { name: 'role', label: 'Role or relationship' }, { name: 'quote', label: 'Recommendation', multiline: true }, { name: 'link', label: 'Profile link', type: 'url', required: false }, { name: 'sortOrder', label: 'Sort order', type: 'number' }];
  return <AdminToken.Provider value={token}><main className="admin-shell"><header className="admin-header"><div><p className="eyebrow">PORTFOLIO CMS</p><h1>Content dashboard</h1></div><div><a className="text-link" href={publicPath} onClick={(event) => { event.preventDefault(); navigate(publicPath); }}>View site ↗</a><button className="outline-button" type="button" onClick={onLogout}>Sign out</button></div></header>{status && <p className="save-status" role="status" aria-live="polite">{status}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    <p className="admin-intro">Your portfolio, always up to date. Edit an entry and save to publish it immediately. No code changes or redeployment needed.</p><nav className="admin-shortcuts" aria-label="Content sections">{['Summary & contact', 'Projects', 'Experience', 'Certifications', 'Recommendations'].map((label) => <a key={label} href={`#cms-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`}>{label}</a>)}</nav><div className="admin-content">
      <EditorCard title="Summary & contact"><RecordEditor title="Public profile" record={data.summary || { fullName: '', headline: '', intro: '', bio: '', location: '', email: '', linkedinUrl: '', githubUrl: '', resumeUrl: '', availabilityStatus: 'open_to_work', bookingUrl: '', currentlyBuilding: '' }} fields={[{ name: 'fullName', label: 'Full name' }, { name: 'headline', label: 'Headline' }, { name: 'intro', label: 'Hero introduction', multiline: true }, { name: 'bio', label: 'About biography', multiline: true }, { name: 'location', label: 'Location' }, { name: 'email', label: 'Email', type: 'email' }, { name: 'resumeUrl', label: 'Résumé PDF or link', type: 'url', uploadAccept: 'application/pdf', required: false, helpText: 'Upload your PDF or paste a public résumé URL.' }, { name: 'availabilityStatus', label: 'Availability status', options: [{ value: 'open_to_work', label: 'Open to work' }, { value: 'interviewing', label: 'Interviewing' }, { value: 'not_looking', label: 'Not looking' }] }, { name: 'bookingUrl', label: 'Booking link', type: 'url', required: false }, { name: 'currentlyBuilding', label: 'Currently building', required: false, placeholder: 'Building a real-time edge vision tool' }, { name: 'linkedinUrl', label: 'LinkedIn URL', type: 'url', required: false }, { name: 'githubUrl', label: 'GitHub URL', type: 'url', required: false }]} busy={busy} onSave={(draft) => save(() => data.summary ? adminApi.saveSummary(token, draft) : adminApi.createSummary(token, draft))} onDelete={data.summary ? () => { if (window.confirm('Delete the public profile?')) return save(() => adminApi.deleteSummary(token)); } : null} saveLabel={data.summary ? 'Save' : 'Create profile'} /></EditorCard>
      <CollectionManager title="Projects" label="project" items={data.projects} empty={emptyProject} fields={projectFields} busy={busy} create={(draft) => save(() => adminApi.createProject(token, draft))} update={(id, draft) => save(() => adminApi.updateProject(token, id, draft))} remove={(id) => { if (window.confirm('Delete this project?')) return save(() => adminApi.deleteProject(token, id)); }} />
      <CollectionManager title="Experience" label="experience entry" items={data.experience} empty={emptyExperience} fields={experienceFields} busy={busy} create={(draft) => save(() => adminApi.createExperience(token, draft))} update={(id, draft) => save(() => adminApi.updateExperience(token, id, draft))} remove={(id) => { if (window.confirm('Delete this experience entry?')) return save(() => adminApi.deleteExperience(token, id)); }} />
      <CollectionManager title="Certifications" label="certification" items={data.certifications} empty={emptyCertification} fields={certificationFields} busy={busy} create={(draft) => save(() => adminApi.createCertification(token, draft))} update={(id, draft) => save(() => adminApi.updateCertification(token, id, draft))} remove={(id) => { if (window.confirm('Delete this certification?')) return save(() => adminApi.deleteCertification(token, id)); }} />
      <CollectionManager title="Recommendations" label="recommendation" items={data.endorsements} empty={emptyEndorsement} fields={endorsementFields} busy={busy} create={(draft) => save(() => adminApi.createEndorsement(token, draft))} update={(id, draft) => save(() => adminApi.updateEndorsement(token, id, draft))} remove={(id) => { if (window.confirm('Delete this recommendation?')) return save(() => adminApi.deleteEndorsement(token, id)); }} />
    </div>
  </main></AdminToken.Provider>;
}

export default function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem('portfolio-admin-token'));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const login = async (credentials) => { try { setBusy(true); setError(''); const response = await adminApi.login(credentials); sessionStorage.setItem('portfolio-admin-token', response.token); setToken(response.token); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  const logout = () => { sessionStorage.removeItem('portfolio-admin-token'); setToken(null); };
  return token ? <AdminDashboard token={token} onLogout={logout} /> : <Login onLogin={login} error={error} busy={busy} />;
}
