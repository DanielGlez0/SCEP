-- Eliminar la restricción UNIQUE que impide asignar el mismo cuestionario múltiples veces
-- Esto permite que un paciente pueda responder el mismo cuestionario en diferentes momentos
-- manteniendo el historial de todas sus respuestas

ALTER TABLE cuestionarios_asignados 
DROP CONSTRAINT IF EXISTS cuestionarios_asignados_paciente_id_cuestionario_id_key;

-- Crear un índice para optimizar las consultas (sin restricción de unicidad)
CREATE INDEX IF NOT EXISTS idx_cuestionarios_paciente_cuestionario 
ON cuestionarios_asignados(paciente_id, cuestionario_id);

-- Verificar que la restricción fue eliminada
-- Ejecuta este query para confirmar:
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'cuestionarios_asignados';
