
DROP POLICY IF EXISTS "anyone_can_insert_onboarding" ON onboarding_submissions;
DROP POLICY IF EXISTS "public_insert_onboarding" ON onboarding_submissions;

CREATE POLICY "Allow public and authenticated users to submit onboarding"
ON onboarding_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
