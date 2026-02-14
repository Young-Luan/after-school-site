// Supabase Edge Function: admin-create-user
// 作用：仅允许管理员创建账号，并写入 profiles 角色信息。

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const authHeader = req.headers.get('Authorization') || '';

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Server env not configured' }, 500);
  }

  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing bearer token' }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const token = authHeader.replace('Bearer ', '').trim();
  const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
  if (userErr || !userData.user) {
    return json({ error: 'Invalid token' }, 401);
  }

  const { data: actorProfile, error: actorErr } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single();

  if (actorErr || actorProfile?.role !== 'admin') {
    return json({ error: 'Only admin can create users' }, 403);
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '').trim();
  const role = String(body.role || 'student').trim();

  if (!email || !password) {
    return json({ error: 'email and password are required' }, 400);
  }

  if (!['admin', 'parent', 'student'].includes(role)) {
    return json({ error: 'invalid role' }, 400);
  }

  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
  });

  if (createErr || !created.user) {
    return json({ error: createErr?.message || 'create user failed' }, 400);
  }

  const { error: profileErr } = await adminClient.from('profiles').upsert({
    id: created.user.id,
    role,
    must_reset_password: true
  });

  if (profileErr) {
    return json({ error: profileErr.message }, 400);
  }

  return json({ ok: true, user_id: created.user.id, email, role });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
