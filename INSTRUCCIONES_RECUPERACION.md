# Instrucciones para Recuperar el Acceso

## Problema
El error "User from sub claim in JWT does not exist" indica que la sesión actual apunta a un usuario de autenticación que ya no existe.

## Solución Rápida

### Opción 1: Cerrar Sesión y Volver a Crear Usuario (MÁS FÁCIL)

1. **En la aplicación**, haz clic en cerrar sesión
2. **Ve a Supabase Dashboard** → Authentication → Users
3. **Elimina** cualquier usuario que veas ahí
4. **En la aplicación**, regístrate de nuevo con:
   - Email: `angelaniel2050@gmail.com`
   - Password: (tu contraseña)
5. **Ejecuta el script** `poblar_base_completa.sql` en Supabase SQL Editor
6. Recarga la aplicación

### Opción 2: Limpiar LocalStorage (ALTERNATIVA)

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Application** (Chrome) o **Storage** (Firefox)
3. En el panel izquierdo, busca **Local Storage**
4. Selecciona tu dominio (localhost:5173)
5. **Elimina todas las claves** que empiecen con `sb-`
6. Recarga la página (F5)
7. Inicia sesión de nuevo

### Opción 3: Ejecutar Script SQL para Vincular (AVANZADA)

Si quieres mantener el usuario existente en la tabla `usuarios`:

```sql
-- Obtener el ID de autenticación actual
SELECT id, email FROM auth.users WHERE email = 'angelaniel2050@gmail.com';

-- Si no existe, lo tienes que crear desde la UI de Authentication
-- Luego vincularlo:
UPDATE usuarios 
SET auth_id = (SELECT id FROM auth.users WHERE email = 'angelaniel2050@gmail.com')
WHERE email = 'angelaniel2050@gmail.com';
```

## Después de Recuperar el Acceso

1. Ejecuta `poblar_base_completa.sql` si la base está vacía
2. Ejecuta `enable_rls_policies.sql` para configurar las políticas
3. Recarga la aplicación y verás todos los datos

## Notas Importantes

- **NUNCA** ejecutes `limpiar_duplicados.sql` - ese archivo borra TODO
- Usa `poblar_base_completa.sql` para crear datos de prueba
- El único psicólogo debe ser: `angelaniel2050@gmail.com`
