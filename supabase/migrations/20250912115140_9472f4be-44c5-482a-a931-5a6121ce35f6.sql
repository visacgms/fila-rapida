-- Fix Function Search Path Mutable issues for all database functions

-- Update fn_set_senha_p function with secure search path
CREATE OR REPLACE FUNCTION public.fn_set_senha_p()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  if new.senha is null or new.senha = '' then
    new.senha := 'P-' || lpad(nextval('seq_senha_p')::text, 4, '0');
  end if;
  return new;
end$function$;

-- Update fn_set_senha_n function with secure search path  
CREATE OR REPLACE FUNCTION public.fn_set_senha_n()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  
SET search_path = public
AS $function$
begin
  if new.senha is null or new.senha = '' then
    new.senha := 'N-' || lpad(nextval('seq_senha_n')::text, 4, '0');
  end if;
  return new;
end$function$;

-- Update fn_guard_campos_protegidos function with secure search path
CREATE OR REPLACE FUNCTION public.fn_guard_campos_protegidos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  
AS $function$
begin
  if new.id is distinct from old.id
     or new.senha is distinct from old.senha
     or new.created_at is distinct from old.created_at then
    raise exception 'Campos protegidos não podem ser alterados (id/senha/created_at).';
  end if;
  return new;
end$function$;