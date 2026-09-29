-- Applies Eswar's supplied public contact address without overwriting an
-- address that has already been deliberately changed in the CMS.
UPDATE summary
SET
  email = 'eswarjajjra@gmail.com',
  updated_at = CURRENT_TIMESTAMP
WHERE id = 1
  AND (email IS NULL OR BTRIM(email) = '' OR email = 'hello@eswarvardan.dev');
