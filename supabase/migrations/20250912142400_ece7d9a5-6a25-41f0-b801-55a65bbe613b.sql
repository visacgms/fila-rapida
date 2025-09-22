-- Disable RLS temporarily to test if it's a policy issue
-- We'll re-enable with proper policies after

-- Disable RLS on both tables temporarily
ALTER TABLE senhas_normal DISABLE ROW LEVEL SECURITY;
ALTER TABLE senhas_prioritario DISABLE ROW LEVEL SECURITY;