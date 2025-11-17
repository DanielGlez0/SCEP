Deployment guide — Vercel serverless function for creating users + profiles

Overview
- This guide shows how to deploy the serverless API `api/create_user_and_profiles.js` to Vercel.
- The function creates a Supabase Auth user (admin) and then calls the DB RPC `create_profiles_for_auth`.
- The function must be protected using an internal secret (`INTERNAL_API_SECRET`) and uses the `service_role` key.

Pre-requisites
1. RPC `create_profiles_for_auth` created in Supabase (see `server/sql/create_profiles_rpc.sql`).
2. Vercel account and the Vercel CLI (optional) or connect your GitHub repo to Vercel.
3. Environment variables set in Vercel dashboard (Project Settings > Environment Variables):
   - `SUPABASE_URL` = https://<your-project>.supabase.co
   - `SUPABASE_SERVICE_ROLE_KEY` = <service_role_key>
   - `INTERNAL_API_SECRET` = <strong-random-secret-string>

Deployment steps (Git-based)
1. Commit the `api/create_user_and_profiles.js` file to your repository and push to the branch linked to Vercel.
2. In the Vercel project settings, add the environment variables above (set for `Preview` and `Production` as needed).
3. Vercel will auto-deploy the branch. The function will be available at:
   `https://<your-vercel-domain>/.netlify/functions/create_user_and_profiles` (Vercel uses `/.vercel/functions/` under the hood) — but you can call it via the public URL:
   `https://<your-vercel-app>.vercel.app/api/create_user_and_profiles`

Example request (curl)
```bash
curl -X POST 'https://<your-vercel-app>.vercel.app/api/create_user_and_profiles' \
  -H 'Content-Type: application/json' \
  -H 'x-internal-secret: <INTERNAL_API_SECRET>' \
  -d '{"email":"correo@ejemplo.com","password":"Password123","nombre":"Juan Perez","edad":30,"telefono":"+34123456789","email_confirm":true}'
```

Notes and security
- NEVER store `SUPABASE_SERVICE_ROLE_KEY` in the frontend or in public repos.
- Use the `INTERNAL_API_SECRET` header to prevent public abuse. For extra security, restrict the function to only allow calls from certain IPs or integrate with your admin auth.
- The function performs manual rollback by deleting the created Auth user if the DB RPC fails.
- Consider adding rate-limiting and logging when moving to production.

Alternative platforms
- Netlify Functions: structure is similar (`netlify/functions/create_user_and_profiles.js`) but deployment and env var UI differ.
- Cloud Run / Cloud Functions: you can wrap the logic in an Express app and deploy as a container.

If you want, puedo:
- Adapt the function to Netlify, or
- Add JWT-based protection (so only an admin with a JWT can call it), or
- Implement logging and basic rate-limiting middleware.
