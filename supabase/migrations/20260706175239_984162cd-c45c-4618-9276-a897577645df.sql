CREATE TABLE public.pronunciation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT,
  dialect TEXT,
  level TEXT,
  target_sentence TEXT,
  transcript TEXT,
  score INTEGER,
  issues JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  practice_tip TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pronunciation_sessions TO authenticated;
GRANT ALL ON public.pronunciation_sessions TO service_role;
GRANT INSERT ON public.pronunciation_sessions TO anon;

ALTER TABLE public.pronunciation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage own sessions" ON public.pronunciation_sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can insert anonymous session" ON public.pronunciation_sessions
  FOR INSERT TO anon WITH CHECK (guest_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Guest can read own sessions" ON public.pronunciation_sessions
  FOR SELECT TO anon USING (guest_id IS NOT NULL);

CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id TEXT,
  preferred_language TEXT DEFAULT 'bn',
  preferred_output_lang TEXT DEFAULT 'bn',
  auto_difficulty BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT INSERT ON public.user_profiles TO anon;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can insert guest profile" ON public.user_profiles
  FOR INSERT TO anon WITH CHECK (guest_id IS NOT NULL AND user_id IS NULL);

CREATE POLICY "Guest can read own profile" ON public.user_profiles
  FOR SELECT TO anon USING (guest_id IS NOT NULL);