-- Migration to support user_periodization_plans

CREATE TABLE IF NOT EXISTS public.user_periodization_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_week INTEGER DEFAULT 1,
    plan_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT user_periodization_plans_profile_id_key UNIQUE (profile_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_periodization_plans ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own periodization plans"
    ON public.user_periodization_plans FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own periodization plans"
    ON public.user_periodization_plans FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own periodization plans"
    ON public.user_periodization_plans FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own periodization plans"
    ON public.user_periodization_plans FOR DELETE
    USING (auth.uid() = profile_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_periodization_plans_profile_id ON public.user_periodization_plans(profile_id);
