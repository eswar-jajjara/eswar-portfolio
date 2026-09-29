import { appendFile } from 'node:fs/promises';

// Never log response bodies: environment-variable responses contain secrets.
const env = process.env;
const runtimeNames = ['DATABASE_URL', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'JWT_SECRET', 'ADMIN_USERNAME', 'ADMIN_PASSWORD_HASH', 'CORS_ALLOWED_ORIGINS'];
for (const key of ['RENDER_API_KEY', ...runtimeNames]) {
  if (!env[key]) throw new Error(`Missing GitHub Actions secret: ${key}`);
}
async function render(path, method = 'GET', body) {
  const response = await fetch(`https://api.render.com/v1${path}`, {
    method, signal: AbortSignal.timeout(60000),
    headers: { Authorization: `Bearer ${env.RENDER_API_KEY}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const hint = response.status === 402 ? ' Render requires account/payment verification. No paid plan was requested; complete verification yourself in the dashboard.' : '';
    throw new Error(`Render ${method} ${path.split('?')[0]} failed (HTTP ${response.status}).${hint}`);
  }
  return response.status === 204 ? null : response.json();
}
const name = 'eswar-portfolio-api';
const repo = `https://github.com/${env.GITHUB_REPOSITORY}`;
let service;
let deploymentId;
if (env.RENDER_SERVICE_ID) service = await render(`/services/${env.RENDER_SERVICE_ID}`);
else {
  if (!env.RENDER_OWNER_ID) throw new Error('Set RENDER_SERVICE_ID for an existing backend or RENDER_OWNER_ID to create one on the free plan.');
  const results = await render(`/services?name=${name}&ownerId=${encodeURIComponent(env.RENDER_OWNER_ID)}&limit=100`);
  const matches = results.map(item => item.service).filter(item => item?.name === name && item.ownerId === env.RENDER_OWNER_ID);
  if (matches.length > 1) throw new Error('Multiple matching services; set RENDER_SERVICE_ID explicitly.');
  service = matches[0];
  if (!service) {
    const result = await render('/services', 'POST', {
      type: 'web_service', name, ownerId: env.RENDER_OWNER_ID, repo, branch: 'main', rootDir: 'backend', autoDeployTrigger: 'off',
      envVars: runtimeNames.map(key => ({ key, value: env[key] })),
      serviceDetails: { runtime: 'docker', plan: 'free', region: 'ohio', healthCheckPath: '/actuator/health',
        envSpecificDetails: { dockerfilePath: './Dockerfile', dockerContext: '.', dockerCommand: '' } },
    });
    service = result.service;
    deploymentId = result.deployId;
    console.log(`Created free backend: ${service.id}`);
  }
}
if (!service?.id || service.type !== 'web_service' || service.repo?.replace(/\.git$/, '') !== repo) {
  throw new Error('The selected service does not match this repository; refusing to alter it.');
}
if (!deploymentId) {
  for (const key of runtimeNames) await render(`/services/${service.id}/env-vars/${key}`, 'PUT', { value: env[key] });
  const deployment = await render(`/services/${service.id}/deploys`, 'POST', { clearCache: 'do_not_clear', commitId: env.GITHUB_SHA });
  deploymentId = deployment.id;
}
if (!deploymentId) throw new Error('Render did not return a deployment ID.');
console.log(`Waiting for backend deployment ${deploymentId}`);
for (let attempt = 0; attempt < 120; attempt++) {
  const deployment = await render(`/services/${service.id}/deploys/${deploymentId}`);
  console.log(`Backend status: ${deployment.status}`);
  if (deployment.status === 'live') {
    if (deployment.commit?.id && deployment.commit.id !== env.GITHUB_SHA) throw new Error('Deployed commit differs from the validated workflow commit. Run the workflow again.');
    const details = await render(`/services/${service.id}`);
    const apiUrl = details.serviceDetails?.url;
    if (!apiUrl?.startsWith('https://')) throw new Error('Render did not return an HTTPS service URL.');
    await appendFile(env.GITHUB_OUTPUT, `api_url=${apiUrl}\nservice_id=${service.id}\n`);
    await appendFile(env.GITHUB_STEP_SUMMARY, `Backend deployed: [${apiUrl}](${apiUrl}/actuator/health)\n\nService ID: ${service.id}\n`);
    process.exit(0);
  }
  if (/failed|canceled|deactivated/.test(deployment.status)) throw new Error('Render deployment failed. Review the build/runtime logs in the Render dashboard.');
  await new Promise(resolve => setTimeout(resolve, 10000));
}
throw new Error('Timed out waiting for Render deployment.');
