-- Small portfolio documents and images survive application restarts/redeploys.
CREATE TABLE portfolio_media (
  id UUID PRIMARY KEY,
  file_name VARCHAR(240) NOT NULL,
  content_type VARCHAR(80) NOT NULL,
  content BYTEA NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
