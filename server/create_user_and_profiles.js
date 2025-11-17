/*
Server-side script: crea un usuario en Supabase Auth (admin) y luego crea los registros
en `usuarios` y `pacientes` llamando al RPC `create_profiles_for_auth`.

Requisitos:
- Definir las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- Tener creada la función RPC `create_profiles_for_auth` (ver `server/sql/create_profiles_rpc.sql`).

Uso (local):
  node create_user_and_profiles.js "email@example.com" "Secret123" "Nombre Paciente" 30  "+34123456789"

Nota de seguridad: este script usa la `service_role` key. No lo ejecutes desde el cliente/ navegador.
*/

const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Define SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.');
  process.exit(1);
}

async function createAuthUser(email, password, email_confirm = false) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users`;
  const body = {
    email,
    password,
    email_confirm
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Crear auth user falló: ${res.status} ${JSON.stringify(json)}`);
  }
  return json; // devuelve objeto del usuario creado (incluye `id`)
}

async function deleteAuthUser(authId) {
  const url = `${SUPABASE_URL}/auth/v1/admin/users/${authId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY
    }
  });
  if (!res.ok) {
    const txt = await res.text();
    console.warn('No se pudo eliminar auth user:', res.status, txt);
  }
}

async function callCreateProfilesRpc(authId, nombre, edad, telefono) {
  const url = `${SUPABASE_URL}/rest/v1/rpc/create_profiles_for_auth`;
  const payload = {
    p_auth_id: authId,
    p_nombre: nombre,
    p_edad: edad === null ? null : Number(edad),
    p_telefono: telefono === null ? null : Number(telefono),
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'apikey': SERVICE_ROLE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`RPC create_profiles_for_auth fallo: ${res.status} ${JSON.stringify(json)}`);
  }
  return json;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 5) {
    console.log('Uso: node create_user_and_profiles.js <email> <password> <nombre> <edad> <telefono> [email_confirm:true|false]');
    process.exit(1);
  }

  const [email, password, nombre, edadStr, telefonoRaw, emailConfirmStr] = args;
  const edad = edadStr ? Number(edadStr) : null;
  const telefono = telefonoRaw ? parseInt(String(telefonoRaw).replace(/\D/g, ''), 10) : null;
  const email_confirm = (emailConfirmStr === 'true');

  let authUser = null;
  try {
    console.log('Creando usuario en Auth...');
    authUser = await createAuthUser(email, password, email_confirm);
    const authId = authUser?.id || authUser?.user?.id;
    if (!authId) throw new Error('No se obtuvo authId del resultado de creación.');

    console.log('Llamando RPC para crear usuarios y pacientes...');
    const rpcRes = await callCreateProfilesRpc(authId, nombre, edad, telefono);
    console.log('Operación completada:', rpcRes);
    console.log('Usuario creado con authId:', authId);
  } catch (err) {
    console.error('Error durante la operación:', err.message || err);
    // cleanup: si creamos el usuario en Auth, eliminarlo para evitar huérfanos
    try {
      const authId = authUser?.id || authUser?.user?.id;
      if (authId) {
        console.log('Intentando eliminar usuario Auth por rollback:', authId);
        await deleteAuthUser(authId);
      }
    } catch (cleanupErr) {
      console.error('Error al limpiar auth user:', cleanupErr);
    }
    process.exit(1);
  }
}

main();
