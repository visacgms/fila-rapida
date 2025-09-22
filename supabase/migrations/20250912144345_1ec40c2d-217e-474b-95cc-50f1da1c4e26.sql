-- Clear all data from password tables for production
DELETE FROM senhas_normal;
DELETE FROM senhas_prioritario;

-- Reset the sequences to start from 1 again
ALTER SEQUENCE seq_senha_n RESTART WITH 1;
ALTER SEQUENCE seq_senha_p RESTART WITH 1;