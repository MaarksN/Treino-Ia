#!/usr/bin/env node

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
};

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let body = null;

  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  return { response, body };
}

function assertStatus(label, actual, expected) {
  const allowed = Array.isArray(expected) ? expected : [expected];
  if (!allowed.includes(actual)) {
    throw new Error(`${label}: expected ${allowed.join('/')} but got ${actual}`);
  }
}

function assertNoOtherUserIds(body) {
  const userId = body?.user?.id;
  if (!userId || typeof userId !== 'string') {
    throw new Error('compliance export did not include authenticated user id');
  }

  const serialized = JSON.stringify(body);
  const uuidPattern = /"user_id":"([0-9a-f-]{36})"/gi;
  const unexpected = new Set();
  let match;

  while ((match = uuidPattern.exec(serialized)) !== null) {
    if (match[1] !== userId) unexpected.add(match[1]);
  }

  if (unexpected.size) {
    throw new Error(`compliance export included ${unexpected.size} unexpected user_id value(s)`);
  }
}

async function main() {
  const appUrl = required('STAGING_APP_URL').replace(/\/+$/, '');
  const exportToken = required('SUPABASE_TEST_ACCESS_TOKEN');

  const unauthExport = await requestJson(`${appUrl}/api/compliance/export`, { method: 'POST' });
  assertStatus(
    'compliance export unauthenticated request blocked',
    unauthExport.response.status,
    401,
  );

  const exportResult = await requestJson(`${appUrl}/api/compliance/export`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${exportToken}`,
      'content-type': 'application/json',
    },
  });

  assertStatus('compliance export authenticated request', exportResult.response.status, [200, 429]);
  if (exportResult.response.status === 200) {
    assertNoOtherUserIds(exportResult.body);
  }

  const unauthErasure = await requestJson(`${appUrl}/api/compliance/erasure`, { method: 'POST' });
  assertStatus(
    'compliance erasure unauthenticated request blocked',
    unauthErasure.response.status,
    401,
  );

  if (process.env.COMPLIANCE_SMOKE_CONFIRM_ERASURE === 'DELETE_STAGING_USER') {
    const erasureToken = required('COMPLIANCE_ERASURE_ACCESS_TOKEN');
    const erasureResult = await requestJson(`${appUrl}/api/compliance/erasure`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${erasureToken}`,
        'content-type': 'application/json',
      },
    });
    assertStatus(
      'compliance erasure authenticated request',
      erasureResult.response.status,
      [200, 429],
    );
    console.log(`PASS compliance erasure status=${erasureResult.response.status}`);
  } else {
    console.log(
      'SKIP compliance erasure destructive check; set COMPLIANCE_SMOKE_CONFIRM_ERASURE=DELETE_STAGING_USER',
    );
  }

  console.log(`PASS compliance export status=${exportResult.response.status}`);
}

main().catch((error) => {
  console.error(`FAIL ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
