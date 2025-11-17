-- RPC para crear los perfiles en la base de datos (usuarios + pacientes)
-- Uso: llamar desde servidor con `service_role` key o desde una conexión con suficientes privilegios.

CREATE OR REPLACE FUNCTION public.create_profiles_for_auth(
  p_auth_id uuid,
  p_nombre text,
  p_edad integer,
  p_telefono bigint
)
RETURNS TABLE(usuario_id uuid, paciente_id uuid) AS $$
DECLARE
  v_usuario_id uuid;
BEGIN
  -- Verificar que el auth user exista
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_auth_id) THEN
    RAISE EXCEPTION 'Auth user % not found', p_auth_id;
  END IF;

  -- Insertar fila en usuarios, usando email obtenido desde auth.users
  INSERT INTO public.usuarios (id, auth_id, nombre, edad, telefono, email, rol)
  SELECT gen_random_uuid(), p_auth_id, p_nombre, p_edad, p_telefono, a.email, 'Paciente'
  FROM auth.users a
  WHERE a.id = p_auth_id
  RETURNING id INTO v_usuario_id;

  -- Insertar fila en pacientes (id debe referenciar auth.users(id))
  INSERT INTO public.pacientes (id, nombre, edad)
  VALUES (p_auth_id, p_nombre, p_edad)
  RETURNING id INTO paciente_id;

  usuario_id := v_usuario_id;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTAS:
-- 1) Esta función asume que la tabla `usuarios` y `pacientes` tienen la estructura que compartiste.
-- 2) `SECURITY DEFINER` permite que quien ejecute el RPC herede los permisos del propietario
--    (generalmente el rol que crea la función). Llama al RPC desde un entorno seguro (service_role).
-- 3) Ajusta nombres de columnas si tu esquema difiere.
