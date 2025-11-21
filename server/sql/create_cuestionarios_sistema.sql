-- Agregar campo 'valor' a las opciones de las preguntas
-- Las opciones ahora serán un array de objetos con texto y valor (0-3)

-- NOTA: En Supabase, las opciones ya están como JSON
-- Necesitarás actualizar manualmente las preguntas existentes para que tengan el formato:
-- [
--   {"texto": "Nunca", "valor": 0},
--   {"texto": "A veces", "valor": 1},
--   {"texto": "Frecuentemente", "valor": 2},
--   {"texto": "Siempre", "valor": 3}
-- ]

-- Crear tabla para asignar cuestionarios a pacientes
CREATE TABLE IF NOT EXISTS cuestionarios_asignados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  cuestionario_id BIGINT NOT NULL REFERENCES cuestionarios(id) ON DELETE CASCADE,
  asignado_por UUID REFERENCES usuarios(id),
  fecha_asignacion TIMESTAMPTZ DEFAULT NOW(),
  completado BOOLEAN DEFAULT false,
  fecha_completado TIMESTAMPTZ,
  puntaje_total INTEGER,
  UNIQUE(paciente_id, cuestionario_id)
);

-- Crear tabla para guardar respuestas de cuestionarios
CREATE TABLE IF NOT EXISTS respuestas_cuestionarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cuestionario_asignado_id UUID NOT NULL REFERENCES cuestionarios_asignados(id) ON DELETE CASCADE,
  pregunta_id BIGINT NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  respuesta_texto TEXT NOT NULL,
  respuesta_valor INTEGER NOT NULL CHECK (respuesta_valor >= 0 AND respuesta_valor <= 3),
  fecha_respuesta TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cuestionarios_asignados_paciente ON cuestionarios_asignados(paciente_id);
CREATE INDEX IF NOT EXISTS idx_cuestionarios_asignados_cuestionario ON cuestionarios_asignados(cuestionario_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_cuestionario_asignado ON respuestas_cuestionarios(cuestionario_asignado_id);

-- Comentarios
COMMENT ON TABLE cuestionarios_asignados IS 'Tabla que relaciona pacientes con cuestionarios asignados por psicólogos';
COMMENT ON TABLE respuestas_cuestionarios IS 'Tabla que guarda las respuestas individuales de cada pregunta con su valor';
