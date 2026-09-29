-- Adds verified credentials supplied by Eswar and replaces the generic starter
-- projects with clearly labelled AI, edge, IoT, and cloud learning concepts.

UPDATE projects
SET
  title = 'SentinelEdge - On-Device PPE Detection',
  description = 'A planned learning build exploring on-device PPE detection, camera preprocessing, optimized local inference, and alert-ready events without sending every frame to the cloud.',
  tech_stack = 'Python, OpenCV, YOLOv8, ONNX Runtime, Raspberry Pi, Docker',
  link = NULL,
  image_url = NULL,
  featured = FALSE,
  sort_order = 1,
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000001';

UPDATE projects
SET
  title = 'CloudMesh - Event-Driven IoT Telemetry Platform',
  description = 'A planned learning build exploring MQTT telemetry ingestion for ESP32 devices, device-health tracking, and production-minded APIs for operational monitoring.',
  tech_stack = 'ESP32, MQTT, AWS IoT Core, Java, Spring Boot, PostgreSQL, Docker',
  link = NULL,
  image_url = NULL,
  featured = FALSE,
  sort_order = 2,
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000002';

UPDATE projects
SET
  title = 'AgriPulse - TinyML Smart Irrigation',
  description = 'A planned learning build exploring low-power smart irrigation, local recommendations from soil and environmental readings, and resilience during network outages.',
  tech_stack = 'ESP32, TensorFlow Lite, Edge Impulse, Arduino, MQTT, Python',
  link = NULL,
  image_url = NULL,
  featured = FALSE,
  sort_order = 3,
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000003';

INSERT INTO certifications (id, name, issuer, issued_date, link, sort_order)
SELECT
  '30000000-0000-4000-8000-000000000001',
  'AWS Certified Developer - Associate',
  'Amazon Web Services (AWS)',
  'Aug 21, 2026',
  NULL,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM certifications WHERE name = 'AWS Certified Developer - Associate'
);

INSERT INTO certifications (id, name, issuer, issued_date, link, sort_order)
SELECT
  '30000000-0000-4000-8000-000000000002',
  'AWS Certified Cloud Practitioner',
  'Amazon Web Services (AWS)',
  'Feb 14, 2026',
  NULL,
  2
WHERE NOT EXISTS (
  SELECT 1 FROM certifications WHERE name = 'AWS Certified Cloud Practitioner'
);

INSERT INTO certifications (id, name, issuer, issued_date, link, sort_order)
SELECT
  '30000000-0000-4000-8000-000000000003',
  'Certified Advanced Automation Professional',
  'Automation Anywhere',
  'Aug 25, 2026',
  NULL,
  3
WHERE NOT EXISTS (
  SELECT 1 FROM certifications WHERE name = 'Certified Advanced Automation Professional'
);

INSERT INTO certifications (id, name, issuer, issued_date, link, sort_order)
SELECT
  '30000000-0000-4000-8000-000000000004',
  'GitHub Foundations',
  'GitHub',
  'Jun 22, 2025',
  'https://www.credly.com/go/H1P3eLtS',
  4
WHERE NOT EXISTS (
  SELECT 1 FROM certifications WHERE name = 'GitHub Foundations'
);

INSERT INTO certifications (id, name, issuer, issued_date, link, sort_order)
SELECT
  '30000000-0000-4000-8000-000000000005',
  'Linguaskill General - CEFR B2',
  'Cambridge English',
  'May 20, 2024',
  NULL,
  5
WHERE NOT EXISTS (
  SELECT 1 FROM certifications WHERE name = 'Linguaskill General - CEFR B2'
);
