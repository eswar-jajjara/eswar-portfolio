-- Replace the removed Spring Boot showcase with Eswar's public gaming portal.

UPDATE projects
SET
  title = 'Gaming Portal',
  description = 'A React-based gaming portal with routes for user access, dashboards, leaderboards, groups, tournaments, game play, and gaming gear.',
  tech_stack = 'React, Vite, React Router, Bootstrap, Tailwind CSS',
  link = 'https://github.com/eswar-jajjara/gaming-portal',
  image_url = NULL,
  featured = FALSE,
  sort_order = 3,
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000003'
  AND title = 'Spring Boot Service Foundations'
  AND link = 'https://github.com/eswar-jajjara/jenkins-springboot';
