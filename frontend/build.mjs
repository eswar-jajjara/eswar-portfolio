import { build } from 'vite';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';

const configuredSiteUrl = process.env.VITE_SITE_URL?.trim().replace(/\/+$/, '') || '';
const escapeXml = (value) => value.replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  "'": '&apos;',
  '"': '&quot;',
}[character]));

await build({
  base: process.env.VITE_BASE_PATH || '/',
});

// Pages needs absolute URLs in share metadata and XML sitemaps. The deployment
// workflow supplies VITE_SITE_URL; local builds remain usable without one.
const indexHtml = await readFile('dist/index.html', 'utf8');
await writeFile('dist/index.html', indexHtml.replaceAll('__SITE_URL__', configuredSiteUrl));

const sitemap = configuredSiteUrl
  ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${escapeXml(`${configuredSiteUrl}/`)}</loc>\n  </url>\n</urlset>\n`
  : `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" />\n`;
await writeFile('dist/sitemap.xml', sitemap);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /${configuredSiteUrl ? `\nSitemap: ${configuredSiteUrl}/sitemap.xml` : ''}\n`);

// GitHub Pages serves this shell for a refreshed /admin route in the SPA.
await copyFile('dist/index.html', 'dist/404.html');
await mkdir('dist/admin', { recursive: true });
await writeFile('dist/admin/index.html', (await readFile('dist/index.html', 'utf8')).replace('content="index, follow"', 'content="noindex, nofollow"'));
await writeFile('dist/.nojekyll', '');

// This is an API-generated first-paint fallback. Runtime API reads still refresh
// CMS changes without a rebuild, including when a free backend has been idle.
if (process.env.PORTFOLIO_SNAPSHOT === 'required') {
  const api = process.env.VITE_API_BASE_URL?.replace(/\/$/, '');
  if (!api?.startsWith('https://')) throw new Error('A deployed HTTPS API URL is required');
  const response = await fetch(`${api}/api/public/portfolio`, { signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(`Unable to snapshot public content (${response.status})`);
  const data = await response.json();
  if (!data.summary?.fullName || !Array.isArray(data.projects)) throw new Error('Invalid public portfolio response');
  await writeFile('dist/portfolio-snapshot.json', JSON.stringify(data));
}
