-- Agregar columna 'activo' a la tabla usuarios
-- Esta columna indica si un paciente está activo o inactivo
-- Por defecto todos los usuarios estarán activos (true)

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Actualizar todos los usuarios existentes para que estén activos
UPDATE usuarios 
SET activo = true 
WHERE activo IS NULL;

-- Comentario: 
-- Ejecuta este SQL en el SQL Editor de Supabase
-- Esto agregará la columna 'activo' a la tabla usuarios
-- Todos los pacientes existentes se marcarán como activos por defecto
