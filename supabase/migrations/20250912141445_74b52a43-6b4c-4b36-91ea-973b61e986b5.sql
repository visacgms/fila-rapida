-- Fix RLS policies for senhas_normal and senhas_prioritario tables
-- Drop existing restrictive policies and create proper ones

-- Drop problematic policies for senhas_normal
DROP POLICY IF EXISTS "p_sn_anon_update_block" ON senhas_normal;
DROP POLICY IF EXISTS "p_sn_auth_update" ON senhas_normal;

-- Drop problematic policies for senhas_prioritario  
DROP POLICY IF EXISTS "p_sp_anon_update_block" ON senhas_prioritario;
DROP POLICY IF EXISTS "p_sp_auth_update" ON senhas_prioritario;

-- Create proper update policies for senhas_normal
CREATE POLICY "authenticated_users_can_update_senhas_normal" 
ON senhas_normal 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create proper update policies for senhas_prioritario
CREATE POLICY "authenticated_users_can_update_senhas_prioritario" 
ON senhas_prioritario 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Also ensure anon users can still read but not update
CREATE POLICY "anon_users_can_read_senhas_normal" 
ON senhas_normal 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "anon_users_can_read_senhas_prioritario" 
ON senhas_prioritario 
FOR SELECT 
TO anon 
USING (true);