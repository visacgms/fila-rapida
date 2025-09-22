-- Grant full permissions to authenticated users on both tables
GRANT ALL ON senhas_normal TO authenticated;
GRANT ALL ON senhas_prioritario TO authenticated;

-- Also ensure the view has proper permissions  
GRANT SELECT ON v_senhas TO authenticated, anon;