-- =====================================================
-- Script completo para poblar la base de datos
-- Solo angelaniel2050@gmail.com como psicólogo
-- =====================================================

-- 1. CREAR PSICÓLOGO PRINCIPAL
-- =====================================================
INSERT INTO usuarios (nombre, email, rol, edad, telefono, is_master, activo, creado_en, actualizado_en)
VALUES ('Dr. Ángel González', 'angelaniel2050@gmail.com', 'Psicologo', 35, 5551234567, true, true, NOW(), NOW())
ON CONFLICT (email) 
DO UPDATE SET 
    nombre = 'Dr. Ángel González',
    rol = 'Psicologo',
    edad = 35,
    telefono = 5551234567,
    is_master = true,
    activo = true,
    actualizado_en = NOW();

-- 2. CREAR 15 PACIENTES REALISTAS
-- =====================================================
INSERT INTO usuarios (nombre, email, rol, edad, telefono, is_master, activo, creado_en, actualizado_en)
VALUES 
    ('Ana María Rodríguez García', 'ana.rodriguez@email.com', 'Paciente', 28, 5551234501, false, true, NOW() - INTERVAL '8 months', NOW()),
    ('Carlos Eduardo Sánchez López', 'carlos.sanchez@email.com', 'Paciente', 35, 5551234502, false, true, NOW() - INTERVAL '7 months', NOW()),
    ('María Fernanda López Martínez', 'maria.lopez@email.com', 'Paciente', 42, 5551234503, false, true, NOW() - INTERVAL '6 months', NOW()),
    ('José Luis Martínez Pérez', 'jose.martinez@email.com', 'Paciente', 31, 5551234504, false, true, NOW() - INTERVAL '5 months', NOW()),
    ('Laura Patricia Gómez Ruiz', 'laura.gomez@email.com', 'Paciente', 26, 5551234505, false, true, NOW() - INTERVAL '4 months', NOW()),
    ('Roberto Carlos Hernández Silva', 'roberto.hernandez@email.com', 'Paciente', 45, 5551234506, false, true, NOW() - INTERVAL '3 months', NOW()),
    ('Diana Isabel Torres Ramírez', 'diana.torres@email.com', 'Paciente', 33, 5551234507, false, true, NOW() - INTERVAL '2 months', NOW()),
    ('Miguel Ángel Ramírez Cruz', 'miguel.ramirez@email.com', 'Paciente', 29, 5551234508, false, true, NOW() - INTERVAL '6 weeks', NOW()),
    ('Sofía Gabriela Flores Morales', 'sofia.flores@email.com', 'Paciente', 37, 5551234509, false, true, NOW() - INTERVAL '4 weeks', NOW()),
    ('Fernando Antonio Cruz Jiménez', 'fernando.cruz@email.com', 'Paciente', 40, 5551234510, false, true, NOW() - INTERVAL '3 weeks', NOW()),
    ('Valentina Alejandra Méndez Ortiz', 'valentina.mendez@email.com', 'Paciente', 24, 5551234511, false, true, NOW() - INTERVAL '2 weeks', NOW()),
    ('Ricardo Daniel Vargas Castro', 'ricardo.vargas@email.com', 'Paciente', 38, 5551234512, false, true, NOW() - INTERVAL '10 days', NOW()),
    ('Gabriela Natalia Reyes Guzmán', 'gabriela.reyes@email.com', 'Paciente', 30, 5551234513, false, true, NOW() - INTERVAL '8 days', NOW()),
    ('Andrés Felipe Moreno Díaz', 'andres.moreno@email.com', 'Paciente', 27, 5551234514, false, true, NOW() - INTERVAL '5 days', NOW()),
    ('Isabel Cristina Navarro Vega', 'isabel.navarro@email.com', 'Paciente', 44, 5551234515, false, true, NOW() - INTERVAL '2 days', NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. ASIGNAR PSICÓLOGO A TODOS LOS PACIENTES
-- =====================================================
UPDATE usuarios 
SET psicologo_id = (SELECT id FROM usuarios WHERE email = 'angelaniel2050@gmail.com')
WHERE rol = 'Paciente';

-- 4. CREAR CITAS (35 CITAS DISTRIBUIDAS EN EL TIEMPO)
-- =====================================================
DO $$
DECLARE
    psicologo_id uuid;
BEGIN
    SELECT id INTO psicologo_id FROM usuarios WHERE email = 'angelaniel2050@gmail.com';
    
    -- CITAS PASADAS - Hace 3 meses
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Ana María Rodríguez García', '5551234501', NOW() - INTERVAL '90 days' + INTERVAL '10 hours', psicologo_id, true, false, NOW() - INTERVAL '91 days'),
        ('Carlos Eduardo Sánchez López', '5551234502', NOW() - INTERVAL '90 days' + INTERVAL '14 hours', psicologo_id, true, false, NOW() - INTERVAL '91 days'),
        ('María Fernanda López Martínez', '5551234503', NOW() - INTERVAL '88 days' + INTERVAL '16 hours', psicologo_id, true, false, NOW() - INTERVAL '89 days'),
        ('José Luis Martínez Pérez', '5551234504', NOW() - INTERVAL '85 days' + INTERVAL '11 hours', psicologo_id, true, false, NOW() - INTERVAL '86 days');
    
    -- CITAS PASADAS - Hace 2 meses
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Laura Patricia Gómez Ruiz', '5551234505', NOW() - INTERVAL '60 days' + INTERVAL '9 hours', psicologo_id, true, false, NOW() - INTERVAL '61 days'),
        ('Roberto Carlos Hernández Silva', '5551234506', NOW() - INTERVAL '60 days' + INTERVAL '15 hours', psicologo_id, true, false, NOW() - INTERVAL '61 days'),
        ('Diana Isabel Torres Ramírez', '5551234507', NOW() - INTERVAL '58 days' + INTERVAL '12 hours', psicologo_id, true, false, NOW() - INTERVAL '59 days'),
        ('Miguel Ángel Ramírez Cruz', '5551234508', NOW() - INTERVAL '55 days' + INTERVAL '17 hours', psicologo_id, true, false, NOW() - INTERVAL '56 days'),
        ('Ana María Rodríguez García', '5551234501', NOW() - INTERVAL '52 days' + INTERVAL '10 hours', psicologo_id, true, false, NOW() - INTERVAL '53 days');
    
    -- CITAS PASADAS - Hace 1 mes
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Sofía Gabriela Flores Morales', '5551234509', NOW() - INTERVAL '30 days' + INTERVAL '10 hours', psicologo_id, true, false, NOW() - INTERVAL '31 days'),
        ('Fernando Antonio Cruz Jiménez', '5551234510', NOW() - INTERVAL '28 days' + INTERVAL '14 hours', psicologo_id, true, false, NOW() - INTERVAL '29 days'),
        ('Valentina Alejandra Méndez Ortiz', '5551234511', NOW() - INTERVAL '25 days' + INTERVAL '16 hours', psicologo_id, true, false, NOW() - INTERVAL '26 days'),
        ('Ricardo Daniel Vargas Castro', '5551234512', NOW() - INTERVAL '22 days' + INTERVAL '11 hours', psicologo_id, true, false, NOW() - INTERVAL '23 days'),
        ('Carlos Eduardo Sánchez López', '5551234502', NOW() - INTERVAL '20 days' + INTERVAL '15 hours', psicologo_id, true, false, NOW() - INTERVAL '21 days');
    
    -- CITAS PASADAS - Última semana
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Gabriela Natalia Reyes Guzmán', '5551234513', NOW() - INTERVAL '6 days' + INTERVAL '9 hours', psicologo_id, true, false, NOW() - INTERVAL '7 days'),
        ('Andrés Felipe Moreno Díaz', '5551234514', NOW() - INTERVAL '5 days' + INTERVAL '14 hours', psicologo_id, true, false, NOW() - INTERVAL '6 days'),
        ('Isabel Cristina Navarro Vega', '5551234515', NOW() - INTERVAL '4 days' + INTERVAL '16 hours', psicologo_id, true, false, NOW() - INTERVAL '5 days'),
        ('María Fernanda López Martínez', '5551234503', NOW() - INTERVAL '3 days' + INTERVAL '12 hours', psicologo_id, true, false, NOW() - INTERVAL '4 days'),
        ('José Luis Martínez Pérez', '5551234504', NOW() - INTERVAL '2 days' + INTERVAL '10 hours', psicologo_id, true, false, NOW() - INTERVAL '3 days');
    
    -- CITAS DE HOY
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Laura Patricia Gómez Ruiz', '5551234505', NOW() + INTERVAL '2 hours', psicologo_id, false, false, NOW() - INTERVAL '1 day'),
        ('Roberto Carlos Hernández Silva', '5551234506', NOW() + INTERVAL '4 hours', psicologo_id, false, false, NOW() - INTERVAL '2 days'),
        ('Diana Isabel Torres Ramírez', '5551234507', NOW() + INTERVAL '6 hours', psicologo_id, false, false, NOW() - INTERVAL '2 days');
    
    -- CITAS PRÓXIMA SEMANA
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Miguel Ángel Ramírez Cruz', '5551234508', NOW() + INTERVAL '2 days' + INTERVAL '10 hours', psicologo_id, false, false, NOW()),
        ('Ana María Rodríguez García', '5551234501', NOW() + INTERVAL '3 days' + INTERVAL '14 hours', psicologo_id, false, false, NOW()),
        ('Sofía Gabriela Flores Morales', '5551234509', NOW() + INTERVAL '4 days' + INTERVAL '11 hours', psicologo_id, false, false, NOW()),
        ('Fernando Antonio Cruz Jiménez', '5551234510', NOW() + INTERVAL '5 days' + INTERVAL '16 hours', psicologo_id, false, false, NOW()),
        ('Valentina Alejandra Méndez Ortiz', '5551234511', NOW() + INTERVAL '6 days' + INTERVAL '9 hours', psicologo_id, false, false, NOW());
    
    -- CITAS DENTRO DE 2 SEMANAS
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Ricardo Daniel Vargas Castro', '5551234512', NOW() + INTERVAL '10 days' + INTERVAL '10 hours', psicologo_id, false, false, NOW()),
        ('Gabriela Natalia Reyes Guzmán', '5551234513', NOW() + INTERVAL '12 days' + INTERVAL '15 hours', psicologo_id, false, false, NOW()),
        ('Andrés Felipe Moreno Díaz', '5551234514', NOW() + INTERVAL '13 days' + INTERVAL '12 hours', psicologo_id, false, false, NOW()),
        ('Isabel Cristina Navarro Vega', '5551234515', NOW() + INTERVAL '14 days' + INTERVAL '9 hours', psicologo_id, false, false, NOW());
    
    -- CITAS CANCELADAS
    INSERT INTO citas (nombre, telefono, hora, psicologo_id, vista, cancelada, created_at)
    VALUES 
        ('Carlos Eduardo Sánchez López', '5551234502', NOW() + INTERVAL '4 days' + INTERVAL '12 hours', psicologo_id, false, true, NOW()),
        ('María Fernanda López Martínez', '5551234503', NOW() - INTERVAL '15 days' + INTERVAL '14 hours', psicologo_id, false, true, NOW() - INTERVAL '16 days'),
        ('José Luis Martínez Pérez', '5551234504', NOW() + INTERVAL '7 days' + INTERVAL '10 hours', psicologo_id, false, true, NOW());
    
    RAISE NOTICE 'Se crearon 35 citas para el psicólogo';
END $$;

-- 5. CREAR CUESTIONARIOS PROFESIONALES
-- =====================================================
INSERT INTO cuestionarios (id, "Titulo", "Descripcion")
VALUES 
    (1, 'Inventario de Depresión de Beck (BDI-II)', 'Cuestionario de 21 ítems que evalúa la gravedad de los síntomas depresivos en adolescentes y adultos.'),
    (2, 'Escala de Ansiedad de Hamilton (HAM-A)', 'Instrumento de 14 ítems diseñado para medir la severidad de los síntomas de ansiedad.'),
    (3, 'Escala de Estrés Percibido (PSS-10)', 'Cuestionario de 10 preguntas que mide el grado en que las situaciones de la vida se perciben como estresantes.'),
    (4, 'Cuestionario de Salud General (GHQ-12)', 'Herramienta de screening de 12 ítems para detectar trastornos psiquiátricos no psicóticos.'),
    (5, 'Escala de Autoestima de Rosenberg', 'Escala de 10 ítems que evalúa la autoestima global, incluyendo sentimientos de respeto y aceptación de sí mismo.'),
    (6, 'Test de Ansiedad Social de Liebowitz (LSAS)', 'Evaluación de 24 situaciones sociales diferentes que pueden producir ansiedad o ser evitadas.'),
    (7, 'Inventario de Ansiedad de Beck (BAI)', 'Cuestionario de 21 preguntas sobre síntomas de ansiedad experimentados durante la última semana.')
ON CONFLICT (id) DO NOTHING;

-- 6. CREAR PREGUNTAS PARA CADA CUESTIONARIO
-- =====================================================

-- Preguntas para BDI-II (Inventario de Depresión de Beck)
INSERT INTO preguntas (texto, cuestionario_id, opciones)
VALUES 
    ('Tristeza', 1, '[{"valor":0,"texto":"No me siento triste"},{"valor":1,"texto":"Me siento triste gran parte del tiempo"},{"valor":2,"texto":"Me siento triste todo el tiempo"},{"valor":3,"texto":"Me siento tan triste que no puedo soportarlo"}]'),
    ('Pesimismo', 1, '[{"valor":0,"texto":"No me siento desanimado respecto a mi futuro"},{"valor":1,"texto":"Me siento más desanimado respecto a mi futuro de lo que solía estarlo"},{"valor":2,"texto":"No espero que las cosas funcionen para mí"},{"valor":3,"texto":"Siento que mi futuro es desesperanzador"}]'),
    ('Fracaso', 1, '[{"valor":0,"texto":"No me siento como un fracasado"},{"valor":1,"texto":"He fracasado más de lo que hubiera debido"},{"valor":2,"texto":"Cuando miro hacia atrás, veo muchos fracasos"},{"valor":3,"texto":"Siento que como persona soy un fracaso total"}]'),
    ('Pérdida de placer', 1, '[{"valor":0,"texto":"Obtengo tanto placer como siempre por las cosas de las que disfruto"},{"valor":1,"texto":"No disfruto tanto de las cosas como solía hacerlo"},{"valor":2,"texto":"Obtengo muy poco placer de las cosas que solía disfrutar"},{"valor":3,"texto":"No puedo obtener ningún placer de las cosas de las que solía disfrutar"}]'),
    ('Sentimientos de culpa', 1, '[{"valor":0,"texto":"No me siento particularmente culpable"},{"valor":1,"texto":"Me siento culpable respecto a varias cosas que he hecho o debería haber hecho"},{"valor":2,"texto":"Me siento bastante culpable la mayor parte del tiempo"},{"valor":3,"texto":"Me siento culpable todo el tiempo"}]');

-- Preguntas para HAM-A (Escala de Ansiedad de Hamilton)
INSERT INTO preguntas (texto, cuestionario_id, opciones)
VALUES 
    ('Estado de ánimo ansioso (preocupaciones, anticipación de lo peor)', 2, '[{"valor":0,"texto":"Ausente"},{"valor":1,"texto":"Leve"},{"valor":2,"texto":"Moderado"},{"valor":3,"texto":"Grave"},{"valor":4,"texto":"Muy grave"}]'),
    ('Tensión (sensación de tensión, fatiga, imposibilidad de relajarse)', 2, '[{"valor":0,"texto":"Ausente"},{"valor":1,"texto":"Leve"},{"valor":2,"texto":"Moderado"},{"valor":3,"texto":"Grave"},{"valor":4,"texto":"Muy grave"}]'),
    ('Temores (a la oscuridad, a los extraños, a estar solo)', 2, '[{"valor":0,"texto":"Ausente"},{"valor":1,"texto":"Leve"},{"valor":2,"texto":"Moderado"},{"valor":3,"texto":"Grave"},{"valor":4,"texto":"Muy grave"}]'),
    ('Insomnio (dificultad para conciliar el sueño, sueño interrumpido)', 2, '[{"valor":0,"texto":"Ausente"},{"valor":1,"texto":"Leve"},{"valor":2,"texto":"Moderado"},{"valor":3,"texto":"Grave"},{"valor":4,"texto":"Muy grave"}]');

-- Preguntas para PSS-10 (Escala de Estrés Percibido)
INSERT INTO preguntas (texto, cuestionario_id, opciones)
VALUES 
    ('En el último mes, ¿con qué frecuencia ha estado afectado por algo que ha ocurrido inesperadamente?', 3, '[{"valor":0,"texto":"Nunca"},{"valor":1,"texto":"Casi nunca"},{"valor":2,"texto":"De vez en cuando"},{"valor":3,"texto":"A menudo"},{"valor":4,"texto":"Muy a menudo"}]'),
    ('En el último mes, ¿con qué frecuencia se ha sentido incapaz de controlar las cosas importantes en su vida?', 3, '[{"valor":0,"texto":"Nunca"},{"valor":1,"texto":"Casi nunca"},{"valor":2,"texto":"De vez en cuando"},{"valor":3,"texto":"A menudo"},{"valor":4,"texto":"Muy a menudo"}]'),
    ('En el último mes, ¿con qué frecuencia se ha sentido nervioso o estresado?', 3, '[{"valor":0,"texto":"Nunca"},{"valor":1,"texto":"Casi nunca"},{"valor":2,"texto":"De vez en cuando"},{"valor":3,"texto":"A menudo"},{"valor":4,"texto":"Muy a menudo"}]'),
    ('En el último mes, ¿con qué frecuencia ha manejado con éxito los pequeños problemas irritantes de la vida?', 3, '[{"valor":0,"texto":"Nunca"},{"valor":1,"texto":"Casi nunca"},{"valor":2,"texto":"De vez en cuando"},{"valor":3,"texto":"A menudo"},{"valor":4,"texto":"Muy a menudo"}]');

-- Preguntas para GHQ-12 (Cuestionario de Salud General)
INSERT INTO preguntas (texto, cuestionario_id, opciones)
VALUES 
    ('¿Ha podido concentrarse bien en lo que hace?', 4, '[{"valor":0,"texto":"Mejor que lo habitual"},{"valor":1,"texto":"Igual que lo habitual"},{"valor":2,"texto":"Menos que lo habitual"},{"valor":3,"texto":"Mucho menos que lo habitual"}]'),
    ('¿Sus preocupaciones le han hecho perder mucho sueño?', 4, '[{"valor":0,"texto":"No, en absoluto"},{"valor":1,"texto":"No más que lo habitual"},{"valor":2,"texto":"Bastante más que lo habitual"},{"valor":3,"texto":"Mucho más que lo habitual"}]'),
    ('¿Ha sentido que está jugando un papel útil en la vida?', 4, '[{"valor":0,"texto":"Más útil que lo habitual"},{"valor":1,"texto":"Igual que lo habitual"},{"valor":2,"texto":"Menos útil que lo habitual"},{"valor":3,"texto":"Mucho menos útil"}]');

-- Preguntas para Escala de Autoestima de Rosenberg
INSERT INTO preguntas (texto, cuestionario_id, opciones)
VALUES 
    ('Siento que soy una persona digna de aprecio, al menos en igual medida que los demás', 5, '[{"valor":1,"texto":"Muy de acuerdo"},{"valor":2,"texto":"De acuerdo"},{"valor":3,"texto":"En desacuerdo"},{"valor":4,"texto":"Muy en desacuerdo"}]'),
    ('Me inclino a pensar que, en conjunto, soy un fracasado', 5, '[{"valor":4,"texto":"Muy de acuerdo"},{"valor":3,"texto":"De acuerdo"},{"valor":2,"texto":"En desacuerdo"},{"valor":1,"texto":"Muy en desacuerdo"}]'),
    ('Creo que tengo algunas cualidades buenas', 5, '[{"valor":1,"texto":"Muy de acuerdo"},{"valor":2,"texto":"De acuerdo"},{"valor":3,"texto":"En desacuerdo"},{"valor":4,"texto":"Muy en desacuerdo"}]'),
    ('Puedo hacer las cosas tan bien como la mayoría de la gente', 5, '[{"valor":1,"texto":"Muy de acuerdo"},{"valor":2,"texto":"De acuerdo"},{"valor":3,"texto":"En desacuerdo"},{"valor":4,"texto":"Muy en desacuerdo"}]');

-- 7. ASIGNAR CUESTIONARIOS A PACIENTES
-- =====================================================
DO $$
DECLARE
    paciente_record RECORD;
    cuestionarios_ids INTEGER[] := ARRAY[1, 2, 3, 4, 5, 6, 7];
    random_cuest_id INTEGER;
BEGIN
    FOR paciente_record IN 
        SELECT id, nombre FROM usuarios WHERE rol = 'Paciente' LIMIT 15
    LOOP
        -- Asignar 2-3 cuestionarios aleatorios a cada paciente
        FOR i IN 1..2 + (random() * 2)::INTEGER LOOP
            random_cuest_id := cuestionarios_ids[1 + (random() * (array_length(cuestionarios_ids, 1) - 1))::INTEGER];
            
            INSERT INTO cuestionarios_asignados (paciente_id, cuestionario_id, completado, puntaje_total, fecha_asignacion, fecha_completado)
            VALUES (
                paciente_record.id,
                random_cuest_id,
                (random() > 0.4), -- 60% completados
                CASE WHEN random() > 0.4 THEN 10 + (random() * 30)::INTEGER ELSE NULL END,
                NOW() - (random() * INTERVAL '30 days'),
                CASE WHEN random() > 0.4 THEN NOW() - (random() * INTERVAL '20 days') ELSE NULL END
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- 8. CREAR REPORTES CLÍNICOS
-- =====================================================
INSERT INTO reportes (paciente_id, titulo, descripcion, creado_en, actualizado_en)
SELECT 
    id,
    'Evaluación Inicial - ' || nombre,
    'Paciente acude a consulta por primera vez presentando sintomatología compatible con trastorno adaptativo. Se realiza anamnesis completa y se establece plan terapéutico centrado en técnicas cognitivo-conductuales. El paciente muestra buena disposición al tratamiento.',
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '1 month'
FROM usuarios WHERE rol = 'Paciente' AND email IN ('ana.rodriguez@email.com', 'carlos.sanchez@email.com', 'maria.lopez@email.com');

INSERT INTO reportes (paciente_id, titulo, descripcion, creado_en, actualizado_en)
SELECT 
    id,
    'Seguimiento - Sesión 5',
    'Se observa evolución favorable en la sintomatología inicial. El paciente reporta mejoría en el manejo de situaciones estresantes y mejor calidad de sueño. Se continúa con técnicas de reestructuración cognitiva y se introducen ejercicios de mindfulness.',
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '2 weeks'
FROM usuarios WHERE rol = 'Paciente' AND email IN ('jose.martinez@email.com', 'laura.gomez@email.com');

-- 9. RESUMEN FINAL
-- =====================================================
SELECT '========== RESUMEN DE DATOS CREADOS ==========' as info;

SELECT 'PSICÓLOGO:' as info;
SELECT nombre, email, rol FROM usuarios WHERE rol = 'Psicologo';

SELECT 'PACIENTES:' as info;
SELECT COUNT(*) as total_pacientes FROM usuarios WHERE rol = 'Paciente';

SELECT 'CITAS:' as info;
SELECT 
    COUNT(*) as total_citas,
    SUM(CASE WHEN vista THEN 1 ELSE 0 END) as citas_vistas,
    SUM(CASE WHEN cancelada THEN 1 ELSE 0 END) as citas_canceladas,
    SUM(CASE WHEN NOT vista AND NOT cancelada THEN 1 ELSE 0 END) as citas_pendientes
FROM citas;

SELECT 'CUESTIONARIOS:' as info;
SELECT COUNT(*) as total_cuestionarios FROM cuestionarios;
SELECT COUNT(*) as total_preguntas FROM preguntas;
SELECT COUNT(*) as total_asignados FROM cuestionarios_asignados;
SELECT SUM(CASE WHEN completado THEN 1 ELSE 0 END) as completados FROM cuestionarios_asignados;

SELECT 'REPORTES:' as info;
SELECT COUNT(*) as total_reportes FROM reportes;

SELECT '✓ Base de datos poblada exitosamente con datos realistas' as resultado;
