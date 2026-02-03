-- Add email column to profiles for easier user lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = (SELECT email FROM auth.users u WHERE u.id = p.user_id)
WHERE p.email IS NULL;