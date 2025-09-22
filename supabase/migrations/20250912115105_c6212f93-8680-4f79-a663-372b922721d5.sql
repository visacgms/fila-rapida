-- Fix Security Definer View issue by recreating v_senhas view properly

-- Drop the existing view
DROP VIEW IF EXISTS public.v_senhas;

-- Recreate the view without security definer issues
-- The view will inherit security from the underlying tables' RLS policies
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

-- Set security barrier to ensure RLS is enforced
ALTER VIEW public.v_senhas SET (security_barrier = true);

-- Grant appropriate permissions
GRANT SELECT ON public.v_senhas TO anon;
GRANT SELECT ON public.v_senhas TO authenticated;