-- Keep the public project showcase aligned with the portfolio owner's confirmed skills.

UPDATE projects
SET
  description = 'A distributed crop-protection prototype for monitoring animal-intrusion events across a local multi-device setup. It pairs Python services with MySQL-backed event records and a React monitoring dashboard.',
  tech_stack = 'Python, React, MySQL, Docker',
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000001'
  AND title = 'Edge-Based Animal Intrusion Detection'
  AND link = 'https://github.com/eswar-jajjara/animal-intrusion-detection';

UPDATE projects
SET
  tech_stack = 'Python, Django, MySQL',
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000002'
  AND title = 'CamStream'
  AND link = 'https://github.com/eswar-jajjara/camstream';
