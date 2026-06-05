#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

function createUserClient(supabaseUrl, anonKey, accessToken) {
  return createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

async function getUserId(client, label, accessToken) {
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user?.id) {
    throw new Error(`${label}: invalid Supabase access token`);
  }
  return data.user.id;
}

function assertNoRows(label, data, error) {
  if (error) throw new Error(`${label}: ${error.message}`);
  if (Array.isArray(data) && data.length === 0) return;
  throw new Error(
    `${label}: cross-user access returned ${Array.isArray(data) ? data.length : 'unknown'} row(s)`,
  );
}

async function main() {
  const supabaseUrl = required('SUPABASE_URL').replace(/\/+$/, '');
  const anonKey = required('SUPABASE_ANON_KEY');
  const tokenA = required('TENANT_A_ACCESS_TOKEN');
  const tokenB = required('TENANT_B_ACCESS_TOKEN');
  const runId = `tenant-ab-${Date.now()}`;

  const clientA = createUserClient(supabaseUrl, anonKey, tokenA);
  const clientB = createUserClient(supabaseUrl, anonKey, tokenB);
  const userAId = await getUserId(clientA, 'tenant-a', tokenA);
  const userBId = await getUserId(clientB, 'tenant-b', tokenB);

  if (userAId === userBId) {
    throw new Error('TENANT_A_ACCESS_TOKEN and TENANT_B_ACCESS_TOKEN belong to the same user');
  }

  let insertedId = null;

  try {
    const insert = await clientA
      .from('workout_sessions')
      .insert({
        user_id: userAId,
        day_name: 'Tenant A/B smoke',
        status: 'in_progress',
        metadata_json: { source: 'tenant-ab-smoke', runId },
      })
      .select('id,user_id')
      .single();

    if (insert.error || !insert.data?.id) {
      throw new Error(`tenant-a insert failed: ${insert.error?.message ?? 'missing inserted id'}`);
    }

    insertedId = insert.data.id;

    const crossRead = await clientB
      .from('workout_sessions')
      .select('id,user_id')
      .eq('id', insertedId);
    assertNoRows('tenant-b SELECT tenant-a workout_session', crossRead.data, crossRead.error);

    const crossUpdate = await clientB
      .from('workout_sessions')
      .update({ day_name: 'Tenant B should not update this' })
      .eq('id', insertedId)
      .select('id');
    assertNoRows('tenant-b UPDATE tenant-a workout_session', crossUpdate.data, crossUpdate.error);

    const crossDelete = await clientB
      .from('workout_sessions')
      .delete()
      .eq('id', insertedId)
      .select('id');
    assertNoRows('tenant-b DELETE tenant-a workout_session', crossDelete.data, crossDelete.error);

    console.log(
      'PASS tenant-ab-isolation workout_sessions cross-user SELECT/UPDATE/DELETE blocked',
    );
  } finally {
    if (insertedId) {
      await clientA.from('workout_sessions').delete().eq('id', insertedId);
    }
  }
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
