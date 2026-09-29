-- Replace these starter records from the protected /admin dashboard after the first login.
INSERT INTO summary (id, full_name, headline, intro, bio, location, email, linkedin_url, github_url)
VALUES (
  1,
  'Eswar Vardan Jajjara',
  'AI / ML Engineer · Edge Computing Engineer · IoT Solutions Architect',
  'Final-year B.Tech CSE student specializing in AI-Driven Edge Architectures & Applications. I build practical systems that bring machine intelligence closer to real-world devices.',
  'I am interested in the full path from sensing and data acquisition to efficient inference and usable software. My focus is on computer vision, TinyML, connected devices, and dependable engineering foundations that make edge intelligence useful outside a demo.',
  'India',
  'hello@eswarvardan.dev',
  NULL,
  'https://github.com/eswar-jajjara'
);

INSERT INTO projects (id, title, description, tech_stack, link, image_url, featured, sort_order) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Edge Vision Analytics', 'A computer-vision prototype designed to run inference near the camera, reducing latency and unnecessary upstream data transfer.', 'Python, OpenCV, TensorFlow, ONNX, Raspberry Pi', NULL, NULL, TRUE, 1),
  ('10000000-0000-4000-8000-000000000002', 'IoT Telemetry Pipeline', 'A connected-device proof of concept that collects sensor readings, publishes resilient telemetry, and exposes a clear operational view.', 'ESP32, MQTT, Java, Spring Boot, PostgreSQL, Docker', NULL, NULL, TRUE, 2),
  ('10000000-0000-4000-8000-000000000003', 'TinyML Signal Classifier', 'An embedded ML experiment exploring compact classification models for low-power, continuously sampled sensor data.', 'Python, TensorFlow, Edge Impulse, Arduino, Git', NULL, NULL, TRUE, 3);

INSERT INTO experience (id, role, company, start_date, end_date, description, sort_order) VALUES
  ('20000000-0000-4000-8000-000000000001', 'Final-Year B.Tech CSE Student', 'Academic & self-directed engineering work', 'Present', NULL, 'Developing an applied portfolio around AI-driven edge architectures, intelligent devices, and production-minded software systems.', 1);

-- No certifications are seeded because verified credential details were not supplied. Add them through /admin.
