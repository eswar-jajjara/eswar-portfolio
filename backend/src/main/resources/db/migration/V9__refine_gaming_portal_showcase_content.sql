-- Use the verified project name and public React application capabilities.

UPDATE projects
SET
  title = 'PROARENA — Gaming Tournament Portal',
  description = 'A responsive React gaming portal with account access, tournament creation and registration, leaderboards, groups, game-play, and gaming-gear views. It uses client-side routing and an Axios API client for authenticated requests.',
  tech_stack = 'React, Vite, React Router, Bootstrap, Axios',
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000003'
  AND title = 'Gaming Portal'
  AND link = 'https://github.com/eswar-jajjara/gaming-portal';
