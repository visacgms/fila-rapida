-- Create profiles table for user management with roles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nome_completo TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'atendente' CHECK (role IN ('admin', 'atendente')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert profiles" 
ON public.profiles FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Users cannot change their own role
  role = (SELECT role FROM public.profiles WHERE user_id = auth.uid())
);

-- Function to create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome_completo, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    NEW.email,
    'atendente'
  );
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update function for updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add guiche column to password tables to track which counter is calling
ALTER TABLE public.senhas_normal ADD COLUMN guiche TEXT;
ALTER TABLE public.senhas_prioritario ADD COLUMN guiche TEXT;

-- Update the view to include guiche
DROP VIEW IF EXISTS public.v_senhas;
CREATE VIEW public.v_senhas AS
SELECT 
    id,
    created_at,
    senha,
    datahoriochamada,
    atendente,
    status,
    local,
    datahorastatus,
    historico,
    guiche,
    'N'::text AS tipo
FROM public.senhas_normal
UNION ALL
SELECT 
    id,
    created_at,
    senha,
    datahoriochamada,
    atendente,
    status,
    local,
    datahorastatus,
    historico,
    guiche,
    'P'::text AS tipo
FROM public.senhas_prioritario;

-- Set security barrier to ensure RLS is enforced
ALTER VIEW public.v_senhas SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.v_senhas TO anon;
GRANT SELECT ON public.v_senhas TO authenticated;