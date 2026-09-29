-- Image paths are frontend public assets. The React app resolves them against its
-- deployment base path, so they work locally and when served from GitHub Pages.

UPDATE projects
SET image_url = CASE id
  WHEN '10000000-0000-4000-8000-000000000001' THEN 'project-cards/animal-intrusion.png'
  WHEN '10000000-0000-4000-8000-000000000002' THEN 'project-cards/camstream.png'
  WHEN '10000000-0000-4000-8000-000000000003' THEN 'project-cards/proarena.png'
END,
updated_at = CURRENT_TIMESTAMP
WHERE id IN (
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000003'
)
AND image_url IS NULL;
