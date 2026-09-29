UPDATE summary
SET github_url = 'https://github.com/eswar-jajjara',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1
  AND (github_url IS NULL OR github_url = '');
