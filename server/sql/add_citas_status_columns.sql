-- Agregar columnas de estado a la tabla citas
-- Ejecutar en Supabase SQL Editor

ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS vista BOOLEAN DEFAULT false;

ALTER TABLE citas 
ADD COLUMN IF NOT EXISTS cancelada BOOLEAN DEFAULT false;

-- Comentario: 
-- vista: indica si la cita ya fue atendida/vista por el psicólogo
-- cancelada: indica si la cita fue cancelada
