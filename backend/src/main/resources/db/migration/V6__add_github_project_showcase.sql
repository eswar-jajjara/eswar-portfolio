-- Replaces only untouched generic project concepts with Eswar's public work.
-- The full-content guards preserve records later edited in the CMS.

UPDATE projects
SET
  title = 'Edge-Based Animal Intrusion Detection',
  description = 'A distributed edge-fog-cloud crop-protection system that detects animal intrusion across a local two- or three-laptop network. It uses Ultralytics YOLO on edge-captured frames, fog and cloud services for event processing, SQLite records, and a React monitoring interface.',
  tech_stack = 'Python, Ultralytics YOLO, React, SQLite, Docker, UDP',
  link = 'https://github.com/eswar-jajjara/animal-intrusion-detection',
  image_url = NULL,
  featured = TRUE,
  sort_order = 1,
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000001'
  AND title = 'SentinelEdge - On-Device PPE Detection'
  AND description = 'A planned learning build exploring on-device PPE detection, camera preprocessing, optimized local inference, and alert-ready events without sending every frame to the cloud.'
  AND tech_stack = 'Python, OpenCV, YOLOv8, ONNX Runtime, Raspberry Pi, Docker'
  AND link IS NULL
  AND image_url IS NULL
  AND featured = FALSE
  AND sort_order = 1;

UPDATE projects
SET
  title = 'CamStream',
  description = 'A Django-based camera-streaming application organized around a dedicated video app, with the project’s latest work focused on a more user-friendly interface.',
  tech_stack = 'Python, Django, SQLite',
  link = 'https://github.com/eswar-jajjara/camstream',
  image_url = NULL,
  featured = FALSE,
  sort_order = 2,
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000002'
  AND title = 'CloudMesh - Event-Driven IoT Telemetry Platform'
  AND description = 'A planned learning build exploring MQTT telemetry ingestion for ESP32 devices, device-health tracking, and production-minded APIs for operational monitoring.'
  AND tech_stack = 'ESP32, MQTT, AWS IoT Core, Java, Spring Boot, PostgreSQL, Docker'
  AND link IS NULL
  AND image_url IS NULL
  AND featured = FALSE
  AND sort_order = 2;

UPDATE projects
SET
  title = 'Spring Boot Service Foundations',
  description = 'A Java Spring Boot service repository with a Maven wrapper and conventional source layout, demonstrating hands-on backend development foundations.',
  tech_stack = 'Java, Spring Boot, Maven',
  link = 'https://github.com/eswar-jajjara/jenkins-springboot',
  image_url = NULL,
  featured = FALSE,
  sort_order = 3,
  updated_at = CURRENT_TIMESTAMP
WHERE id = '10000000-0000-4000-8000-000000000003'
  AND title = 'AgriPulse - TinyML Smart Irrigation'
  AND description = 'A planned learning build exploring low-power smart irrigation, local recommendations from soil and environmental readings, and resilience during network outages.'
  AND tech_stack = 'ESP32, TensorFlow Lite, Edge Impulse, Arduino, MQTT, Python'
  AND link IS NULL
  AND image_url IS NULL
  AND featured = FALSE
  AND sort_order = 3;
