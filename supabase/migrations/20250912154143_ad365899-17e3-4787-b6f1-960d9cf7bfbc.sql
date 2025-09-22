-- Enable real-time for password tables
ALTER TABLE senhas_normal REPLICA IDENTITY FULL;
ALTER TABLE senhas_prioritario REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD table senhas_normal;
ALTER publication supabase_realtime ADD table senhas_prioritario;