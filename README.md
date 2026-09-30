# Eswar Vardan Jajjara — Portfolio CMS

A full-stack, data-driven portfolio for an AI/ML, Edge Computing, and IoT engineering profile. The public site is a responsive React single-page experience; its profile, projects, experience, certifications, endorsements, and GitHub proof are fetched from a Spring Boot REST API. The protected `/admin` route lets the single portfolio owner change recruiter-facing content without rebuilding or redeploying the frontend.

For day-to-day editing, password changes, and troubleshooting, start with the [portfolio owner guide](PORTFOLIO_OWNER_GUIDE.md).

Deployment target: **GitHub Pages** for React, **Render Free** for the Spring Boot API, and **Neon PostgreSQL** for persistent production data.

## Included

- Modern, responsive, accessible, theme-aware portfolio with Hero, About, Skills, Projects, Experience, Certifications, Endorsements, and Contact sections.
- Dynamic public API reads — no portfolio record is embedded in the React application. Project card images are responsive, lazy-loaded WebP assets.
- Protected CMS for adding, editing, and deleting Summary, Projects, Experience, Certifications, and Endorsements, with ordering controls where relevant.
- CMS-managed recruiter signals: resume URL, availability status, booking URL, current focus, optional project impact metrics, and real endorsements. These are editable from `/admin`.
- Live GitHub repository proof (stars, primary language, and last-pushed time) for projects that link to GitHub repositories. It is fetched by the API and cached for six hours.
- JWT login for one administrator, with a per-username/IP failed-login limit. The username and bcrypt password hash come from environment variables.
- Optional Sign in with Google for the exact allowlisted Gmail account. The backend verifies Google's ID token and then issues the same short-lived admin JWT; password login remains available as a backup.
- PostgreSQL Flyway migrations, starter records, Docker Compose for local Postgres, health check, CORS configuration, validation, and integration tests.
- Search/share essentials: Open Graph and Twitter metadata, dynamic `Person` JSON-LD, `robots.txt`, and a sitemap generated during the production build.
- GitHub Actions deployment on every push to `main`. It builds the frontend, publishes it to Pages, runs the API integration tests and packages the API, securely syncs Render runtime secrets, deploys the validated commit, and waits for Render to report success.

Flyway seeds the supplied profile details, five verified credentials, and a three-project showcase linked to Eswar's public GitHub repositories. Add real experience, measured impact, resume and booking links, endorsements, and additional social URLs through `/admin` before publishing.

## Project layout

```text
.
├── frontend/                         # React + Vite public site and admin UI
│   ├── src/App.jsx                   # routes and public sections
│   ├── src/AdminPage.jsx             # lazy-loaded CMS, forms, file uploads
│   ├── src/usePortfolio.js           # API loading, cached first paint, refresh
│   ├── src/api/client.js             # REST client
│   └── src/styles.css                # responsive visual system
├── backend/                          # Spring Boot 3 / Java 21 REST API
│   ├── Dockerfile                     # Render-compatible JVM image
│   ├── src/main/java/.../auth/       # JWT login and security filter
│   ├── src/main/java/.../content/    # entities, CRUD controllers, DTOs
│   ├── src/main/java/.../github/     # cached public GitHub repository metadata
│   ├── src/test/                      # authentication and public API integration tests
│   └── src/main/resources/db/migration/
│       ├── V1__create_portfolio_schema.sql
│       ├── V2__seed_portfolio_content.sql
│       ├── V3__add_github_profile.sql
│       ├── V4__add_certifications_and_featured_projects.sql
│       ├── V5__update_contact_email.sql
│       ├── V6__add_github_project_showcase.sql
│       ├── V7__align_project_stack_with_confirmed_skills.sql
│       ├── V8__replace_spring_boot_showcase_with_gaming_portal.sql
│       ├── V9__refine_gaming_portal_showcase_content.sql
│       ├── V10__add_generated_project_card_images.sql
│       ├── V11__serve_optimized_project_card_images.sql
│       ├── V12__add_recruiter_profile_fields_and_endorsements.sql
│       └── V13__add_persistent_media_uploads.sql
├── .github/workflows/deploy.yml      # Pages + Render CI/CD
├── docker-compose.yml                # local PostgreSQL 16
└── render.yaml                       # Render service blueprint
```

## Local setup

Prerequisites: Node.js 20+ (22 recommended), Java 21, Maven 3.9+, and Docker Desktop with the engine running.

1. Start PostgreSQL from the repository root. The Docker database uses host port `5433` by default to avoid colliding with an existing local PostgreSQL installation. If you override it with `POSTGRES_PORT`, also change `DATABASE_URL` in `backend/.env` to the same port:

   ```powershell
   docker compose up -d postgres
   ```

2. Copy [`backend/.env.example`](backend/.env.example) to `backend/.env`, then replace every `replace-with-...` value. Spring Boot reads this local `.env` file automatically; it is ignored by Git.

   `ADMIN_PASSWORD_HASH` must be a bcrypt hash, not a password. One cross-platform way to generate one is:

   ```powershell
   docker run --rm httpd:2.4-alpine htpasswd -nbB eswar "choose-a-strong-password"
   ```

   Copy only the hash portion after `eswar:` into `ADMIN_PASSWORD_HASH`. Generate `JWT_SECRET` as a unique random value of at least 32 characters. The supplied example permits the actual local frontend origins, `http://localhost:5181` and `http://127.0.0.1:5181`; keep them aligned if you deliberately change the Vite port.

3. In one terminal, start the API:

   ```powershell
   Set-Location backend
   mvn spring-boot:run
   ```

   Flyway applies the schema, initial content, WebP card-image upgrade, and recruiter-field migration at startup. Confirm the service with `http://localhost:8080/actuator/health`.

4. In another terminal, configure and start the frontend:

   ```powershell
   Set-Location frontend
   Copy-Item .env.example .env
   npm ci
   npm run dev
   ```

   Open `http://localhost:5181`, then use `http://localhost:5181/admin` to sign in. Use the `ADMIN_USERNAME` value from `backend/.env` and the original plain-text password used to generate `ADMIN_PASSWORD_HASH`—never the bcrypt hash itself. The token is kept only in the current browser session. Do not use port `5173` for this project: it is intentionally configured to use `5181`.

5. When finished with local data:

   ```powershell
   docker compose down
   ```

## API surface

Public endpoints require no token:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/public/summary` | Profile, bio, contact, social links |
| GET | `/api/public/portfolio` | All public CMS content in one request |
| GET | `/api/public/media/{id}` | Published certificate, resume, or image |
| GET | `/api/public/projects` | Ordered project list |
| GET | `/api/public/experience` | Ordered experience list |
| GET | `/api/public/certifications` | Ordered certification list |
| GET | `/api/public/endorsements` | Ordered real-person recommendations |
| GET | `/api/public/github-projects` | Cached GitHub stars, primary language, and last-pushed time for GitHub-linked projects |

Authentication:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/login` | Accepts `{ "username", "password" }`, returns a JWT |
| POST | `/api/auth/google` | Accepts a Google Identity Services `{ "credential" }` ID token; returns the same admin JWT only for the configured verified Gmail account |

Authenticated endpoints accept `Authorization: Bearer <token>`:

| Resource | Endpoints |
| --- | --- |
| Summary | `GET`, `POST`, `PUT`, `DELETE` `/api/admin/summary` |
| Projects | `GET`, `POST` `/api/admin/projects`; `PUT`, `DELETE` `/api/admin/projects/{id}` |
| Experience | `GET`, `POST` `/api/admin/experience`; `PUT`, `DELETE` `/api/admin/experience/{id}` |
| Certifications | `GET`, `POST` `/api/admin/certifications`; `PUT`, `DELETE` `/api/admin/certifications/{id}` |
| Endorsements | `GET`, `POST` `/api/admin/endorsements`; `PUT`, `DELETE` `/api/admin/endorsements/{id}` |
| Media | `POST` `/api/admin/media` (multipart field `file`, max 5 MB) |

### CMS content fields

| Record | Recruiter-facing fields |
| --- | --- |
| Summary | Existing bio/contact/social fields plus `resumeUrl`, `availabilityStatus` (`open_to_work`, `interviewing`, or `not_looking`), `bookingUrl`, and `currentlyBuilding` |
| Project | Existing title, description, stack, link, image, sort order, and featured state plus optional `impactMetrics` (short proof points separated by `|` or `;`) |
| Endorsement | Name, role/title, quote, optional verification link, and sort order |

The GitHub metadata endpoint only follows conventional `github.com/owner/repository` project links. It uses unauthenticated GitHub API requests, limits a response to 12 repositories, keeps successful or failed lookup results in memory for six hours, and degrades gracefully if GitHub is unavailable. It does not store a GitHub token.

`V1__create_portfolio_schema.sql` and the later Flyway migrations are the database schema history. Hibernate runs in `validate` mode so it cannot silently alter production tables.

## Verify locally

With the API dependencies available, run the backend integration tests:

```powershell
Set-Location backend
mvn test
```

Build the production frontend (including the sitemap, robots file, share metadata substitutions, and SPA fallback):

```powershell
Set-Location frontend
npm run build
```

## Production deployment

### 1. Create the database and Render service

1. Provision a Neon PostgreSQL database. Use its pooled host and a JDBC URL such as `jdbc:postgresql://host:5432/neondb?sslmode=require`; store the username and password separately. Render's free PostgreSQL offering is time-limited, so this deployment uses Neon instead.
2. Create a dedicated Render API key and note your workspace ID (`tea-...`, visible in workspace settings). Set the GitHub secrets below. The workflow creates a **Free** Docker backend in Ohio on the first run, then reuses that exact repository's service on later runs. It never selects a paid plan. Complete any account verification requested by Render yourself.
3. If a backend already exists, set `RENDER_SERVICE_ID` instead of `RENDER_OWNER_ID`. Configure it with root directory `backend`, Dockerfile `./Dockerfile`, Docker context `.`, health check `/actuator/health`, and auto-deploy **Off**. [`render.yaml`](render.yaml) is also supplied as an alternative Blueprint.

### 2. Add repository secrets

In GitHub: **Settings → Secrets and variables → Actions**, create these repository secrets:

| Secret | Value |
| --- | --- |
| `RENDER_API_KEY` | Dedicated Render API key; keep private and revoke when no longer needed |
| `RENDER_OWNER_ID` | Render workspace ID; lets the first workflow create the free backend |
| `RENDER_SERVICE_ID` | Optional existing Render web-service ID; overrides automatic discovery |
| `DATABASE_URL` | Production JDBC PostgreSQL URL |
| `DATABASE_USERNAME` | Production database username |
| `DATABASE_PASSWORD` | Production database password |
| `JWT_SECRET` | New production random secret, at least 32 characters |
| `ADMIN_USERNAME` | CMS username |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of the CMS password |
| `CORS_ALLOWED_ORIGINS` | `https://YOUR_GITHUB_USERNAME.github.io` (plus any custom domain, comma-separated) |
| `GOOGLE_ADMIN_EMAIL` | Optional exact Gmail address allowed to use Google admin login; set together with `GOOGLE_CLIENT_ID` |

Also add a repository **variable** (not a secret) named `VITE_API_BASE_URL`, with the public API origin: `https://eswar-portfolio-api.onrender.com`. If Render assigns a different URL, copy the actual URL from its service page. Public URLs are intentionally configured as variables so GitHub's secret masking cannot remove them from cross-job configuration.

For Google admin login, add a public repository **variable** named `GOOGLE_CLIENT_ID` containing a Google Cloud OAuth **Web application** client ID. It is used both as `VITE_GOOGLE_CLIENT_ID` in the frontend and as `GOOGLE_CLIENT_ID` in Render. Add the `GOOGLE_ADMIN_EMAIL` secret at the same time; if both are absent the Google button stays hidden. Do not add a Google client secret. [The owner guide](PORTFOLIO_OWNER_GUIDE.md#enable-google-admin-sign-in) explains the Google Cloud steps and exact authorized origin.

The workflow transfers backend runtime variables to Render over its authenticated API. They are never committed, printed, or placed in `render.yaml`. The workflow supplies `VITE_SITE_URL` automatically from GitHub Pages to create absolute canonical, Open Graph, Twitter Card, robots, and sitemap URLs.

The login limiter defaults to five failed attempts per username/IP pair followed by a five-minute lockout. If an environment needs different values, configure the non-secret Render environment variables `AUTH_MAX_FAILED_ATTEMPTS` and `AUTH_LOCKOUT_SECONDS`; keep the same values in local `backend/.env` when testing.

### 3. Enable GitHub Pages and deploy

1. Push the repository to GitHub and ensure the default deployment branch is `main`.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow manually). The workflow tests both applications, deploys the exact validated API commit, waits for a healthy Render deployment, builds the frontend with the GitHub Pages base path and an API-generated public-content snapshot, then deploys Pages.

GitHub Pages serves the frontend at `https://YOUR_GITHUB_USERNAME.github.io/REPOSITORY_NAME/`. The build also emits a SPA fallback for a refreshed `/admin` link.

### Edit your live portfolio in the browser

Open `https://eswar-jajjara.github.io/eswar-portfolio/admin/` and sign in using the production admin username/password, or the configured Google button. Edit your profile, skills, projects, experience, certifications, and recommendations, then **Save** the record. Changes are stored in PostgreSQL and require no code changes or redeploy. Open public tabs refresh on focus and every minute while visible.

Project images, certificate PDFs, and a resume PDF can be uploaded directly from the corresponding CMS field. Raster images are resized and converted to WebP in the browser. Uploads are limited to 5 MB and stored in PostgreSQL, not Render's temporary filesystem. Select a file, wait for upload confirmation, then save the record. Only upload files intended to be public; an uploaded file's URL can be downloaded without login. Removing a record does not erase its uploaded file.

Render Free sleeps when idle; the first API request or admin sign-in can take about a minute to wake it. The public site immediately shows cached or build-snapshot content while fetching the latest CMS data. A first-time visitor may briefly see the last deployed snapshot during a cold start; once the API responds, current edits replace it. Monitor the database provider's storage and free-plan limits, especially when uploading PDFs. No payment plan is selected by this project.

## Security notes

- Passwords are never stored in the database or source: only a bcrypt hash is read from the runtime environment.
- Google sign-in uses Google's official browser button. The API verifies the Google-signed ID token's signature, audience, issuer, expiry, verified email, and exact allowlisted Gmail address. A Google client secret is not needed. Changing a Google password does not change the separate backup CMS password.
- The JWT is signed with `JWT_SECRET`, expires after eight hours by default, and is held in `sessionStorage`, not a persistent cookie.
- Login attempts are rate-limited by username/IP pair. Login failures intentionally return the same generic response so an attacker cannot use them to confirm usernames.
- All write endpoints are denied unless the request includes a valid token for the configured admin username.
- CORS is allowlist-based through `CORS_ALLOWED_ORIGINS`; local development uses port `5181`, and production must include the GitHub Pages origin before deployment.
- Public endpoints do not expose admin configuration, credential hashes, or admin controls.
