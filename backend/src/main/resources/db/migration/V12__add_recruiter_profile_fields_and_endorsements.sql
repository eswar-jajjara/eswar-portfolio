-- Recruiter-facing content remains CMS-managed. No endorsements or performance
-- claims are seeded, because those must come from a real person or measured work.

ALTER TABLE summary
  ADD COLUMN resume_url VARCHAR(2000),
  ADD COLUMN availability_status VARCHAR(32) NOT NULL DEFAULT 'open_to_work',
  ADD COLUMN booking_url VARCHAR(2000),
  ADD COLUMN currently_building VARCHAR(500),
  ADD CONSTRAINT summary_availability_status_check
    CHECK (availability_status IN ('open_to_work', 'interviewing', 'not_looking'));

ALTER TABLE projects
  ADD COLUMN impact_metrics VARCHAR(1600);

CREATE TABLE endorsements (
  id UUID PRIMARY KEY,
  name VARCHAR(240) NOT NULL,
  role_title VARCHAR(240) NOT NULL,
  quote_text VARCHAR(2000) NOT NULL,
  link VARCHAR(2000),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX endorsements_sort_order_idx ON endorsements (sort_order, created_at DESC);
