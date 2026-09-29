-- Replace the original card PNGs with responsive, compressed WebP assets.
-- The predicates preserve any image URL an admin has edited in the CMS.

UPDATE projects
SET image_url = CASE id
  WHEN '10000000-0000-4000-8000-000000000001' THEN 'project-cards/animal-intrusion.webp'
  WHEN '10000000-0000-4000-8000-000000000002' THEN 'project-cards/camstream.webp'
  WHEN '10000000-0000-4000-8000-000000000003' THEN 'project-cards/proarena.webp'
END,
updated_at = CURRENT_TIMESTAMP
WHERE (id = '10000000-0000-4000-8000-000000000001' AND image_url = 'project-cards/animal-intrusion.png')
   OR (id = '10000000-0000-4000-8000-000000000002' AND image_url = 'project-cards/camstream.png')
   OR (id = '10000000-0000-4000-8000-000000000003' AND image_url = 'project-cards/proarena.png');
