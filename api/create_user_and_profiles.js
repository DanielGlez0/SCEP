export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Protege la función con un secreto interno
  const secret = req.headers['x-internal-secret'] || req.headers['x-internal-token'];
  if (!secret || secret !== process.env.INTERNAL_API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: 'Server misconfiguration: missing SUPABASE env vars' });
  }

  const { email, password, nombre, edad, telefono, email_confirm } = req.body || {};
  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Missing required fields: email, password, nombre' });
  }

  // Normalize telefono and edad
  const telefonoNum = telefono ? Number(String(telefono).replace(/\D/g, '')) : null;
  const edadNum = (typeof edad === 'number') ? edad : (edad ? Number(edad) : null);

  let authUser = null;
  try {
    // 1) Crear usuario en Auth (Admin)
    const createUrl = `${SUPABASE_URL}/auth/v1/admin/users`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ email, password, email_confirm: !!email_confirm }),
    });

    const createJson = await createRes.json();
    if (!createRes.ok) {
      return res.status(createRes.status).json({ error: 'Failed to create auth user', details: createJson });
    }
    authUser = createJson;
    const authId = authUser?.id || authUser?.user?.id;
    if (!authId) throw new Error('Auth creation returned no id');

    // 2) Llamar RPC para crear filas en usuarios y pacientes
    const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/create_profiles_for_auth`;
    const rpcPayload = {
      p_auth_id: authId,
      p_nombre: nombre,
      p_edad: edadNum,
      p_telefono: telefonoNum,
    };

    const rpcRes = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(rpcPayload),
    });

    const rpcJson = await rpcRes.json();
    if (!rpcRes.ok) {
      // rollback: eliminar auth user
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
        });
      } catch (cleanupErr) {
        console.error('Rollback failed:', cleanupErr);
      }
      return res.status(rpcRes.status).json({ error: 'RPC failed', details: rpcJson });
    }

    // rpcJson puede contener el resultado con usuario_id/paciente_id
    return res.status(200).json({ ok: true, authId, rpc: rpcJson });
  } catch (err) {
    console.error('Error in serverless function:', err);
    // cleanup if authUser created
    try {
      const authId = authUser?.id || authUser?.user?.id;
      if (authId) {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}`, 'apikey': SERVICE_ROLE_KEY },
        });
      }
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr);
    }
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
}
