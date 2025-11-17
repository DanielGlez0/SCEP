Server helper: crear usuario Auth + perfiles (usuarios + pacientes)

Contenido:
- `sql/create_profiles_rpc.sql` : SQL para crear el RPC `create_profiles_for_auth`.
- `create_user_and_profiles.js` : Script Node que crea el usuario en Supabase Auth (admin) y llama al RPC.

Requisitos
1) Variables de entorno (local):
   - `SUPABASE_URL` (ej: https://xyzcompany.supabase.co)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role secret)

2) Crear la función RPC en tu base de datos (usa el SQL en `sql/create_profiles_rpc.sql`).
   - Ve a Supabase > SQL Editor > New Query, pega el SQL y ejecútalo.

3) Instala dependencias (node-fetch):

   ```powershell
   npm install node-fetch
   ```

Uso (ejecutar localmente)

```powershell
$env:SUPABASE_URL="https://tu-proyecto.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="tu_service_role_key"; node server/create_user_and_profiles.js "correo@ejemplo.com" "Password123" "Juan Pérez" 28 "+34123456789" false
```

Notas de seguridad
- La `service_role` key tiene privilegios totales. NO la incluyas en el frontend ni en repositorios públicos.
- Este script intenta un rollback eliminando el usuario Auth si la inserción en la BD falla.

Siguientes pasos recomendados
- Convertir este script en una función serverless (Edge Function / Cloud Run / Netlify Function) y protegerla detrás de autenticación o un firewall.
- Implementar validaciones y logging adicionales.
