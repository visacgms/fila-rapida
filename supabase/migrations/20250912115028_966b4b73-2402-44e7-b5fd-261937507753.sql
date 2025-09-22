-- Fix Security Definer View issue by recreating v_senhas view properly

-- Drop the existing view
DROP VIEW IF EXISTS public.v_senhas;

-- Recreate the view without security definer issues
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
    'P'::text AS tipo
FROM public.senhas_prioritario;

-- Enable RLS on the view
ALTER VIEW public.v_senhas SET (security_barrier = true);

-- Grant proper access to the view
GRANT SELECT ON public.v_senhas TO anon;
GRANT SELECT ON public.v_senhas TO authenticated;

-- Create RLS policies for the view that respect the underlying table policies
ALTER VIEW public.v_senhas ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to select (same as base tables)
CREATE POLICY "v_senhas_anon_select" ON public.v_senhas
FOR SELECT TO anon
USING (true);

-- Allow authenticated users to select (same as base tables)  
CREATE POLICY "v_senhas_auth_select" ON public.v_senhas
FOR SELECT TO authenticated
USING (true);