CREATE TABLE summary (
  id BIGINT PRIMARY KEY CHECK (id = 1),
  full_name VARCHAR(160) NOT NULL,
  headline VARCHAR(240) NOT NULL,
  intro VARCHAR(1600) NOT NULL,
  bio VARCHAR(4000) NOT NULL,
  location VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  linkedin_url VARCHAR(2000),
  github_url VARCHAR(2000),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  title VARCHAR(240) NOT NULL,
  description VARCHAR(4000) NOT NULL,
  tech_stack VARCHAR(2000) NOT NULL,
  link VARCHAR(2000),
  image_url VARCHAR(2000),
  featured BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experience (
  id UUID PRIMARY KEY,
  role VARCHAR(240) NOT NULL,
  company VARCHAR(240) NOT NULL,
  start_date VARCHAR(100) NOT NULL,
  end_date VARCHAR(100),
  description VARCHAR(4000) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY,
  name VARCHAR(320) NOT NULL,
  issuer VARCHAR(240) NOT NULL,
  issued_date VARCHAR(100) NOT NULL,
  link VARCHAR(2000),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX projects_sort_order_idx ON projects (sort_order, created_at DESC);
CREATE INDEX experience_sort_order_idx ON experience (sort_order, created_at DESC);
CREATE INDEX certifications_sort_order_idx ON certifications (sort_order, created_at DESC);
