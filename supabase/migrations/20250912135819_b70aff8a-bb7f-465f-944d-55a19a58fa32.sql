-- Add field to track if password needs to be changed
ALTER TABLE public.profiles 
ADD COLUMN senha_temporaria boolean NOT NULL DEFAULT false;