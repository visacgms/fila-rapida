-- Create first admin user for bootstrap
-- This creates a default admin user so the system can be used initially
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'admin@visacgms.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- Get the created user ID and create profile
INSERT INTO public.profiles (user_id, nome_completo, email, role, ativo)
SELECT 
    id,
    'Administrador do Sistema',
    'admin@visacgms.com',
    'admin',
    true
FROM auth.users 
WHERE email = 'admin@visacgms.com';