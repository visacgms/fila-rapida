-- Simplify RLS policies - allow authenticated users to do everything
-- Drop all existing policies for senhas_normal
DROP POLICY IF EXISTS "p_sn_anon_delete_block" ON senhas_normal;
DROP POLICY IF EXISTS "p_sn_anon_insert" ON senhas_normal;
DROP POLICY IF EXISTS "p_sn_anon_select" ON senhas_normal;
DROP POLICY IF EXISTS "p_sn_auth_select" ON senhas_normal;
DROP POLICY IF EXISTS "authenticated_users_can_update_senhas_normal" ON senhas_normal;
DROP POLICY IF EXISTS "anon_users_can_read_senhas_normal" ON senhas_normal;

-- Drop all existing policies for senhas_prioritario
DROP POLICY IF EXISTS "p_sp_anon_delete_block" ON senhas_prioritario;
DROP POLICY IF EXISTS "p_sp_anon_insert" ON senhas_prioritario;
DROP POLICY IF EXISTS "p_sp_anon_select" ON senhas_prioritario;
DROP POLICY IF EXISTS "p_sp_auth_select" ON senhas_prioritario;
DROP POLICY IF EXISTS "authenticated_users_can_update_senhas_prioritario" ON senhas_prioritario;
DROP POLICY IF EXISTS "anon_users_can_read_senhas_prioritario" ON senhas_prioritario;

-- Create simple policies for senhas_normal
-- Allow anonymous users to insert and select (for tablet interface)
CREATE POLICY "allow_anon_insert_senhas_normal" ON senhas_normal FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_anon_select_senhas_normal" ON senhas_normal FOR SELECT TO anon USING (true);

-- Allow authenticated users to do everything
CREATE POLICY "allow_auth_all_senhas_normal" ON senhas_normal FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create simple policies for senhas_prioritario  
-- Allow anonymous users to insert and select (for tablet interface)
CREATE POLICY "allow_anon_insert_senhas_prioritario" ON senhas_prioritario FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_anon_select_senhas_prioritario" ON senhas_prioritario FOR SELECT TO anon USING (true);

-- Allow authenticated users to do everything
CREATE POLICY "allow_auth_all_senhas_prioritario" ON senhas_prioritario FOR ALL TO authenticated USING (true) WITH CHECK (true);