import test from 'node:test';
import assert from 'node:assert/strict';
import { createRegistrationHandler } from './registration.mjs';

function setup({ failProfile = false } = {}) {
  const calls = [];
  let count = 0;
  const auth = {
    createUser: async (data) => { calls.push(['create', data]); return { uid: 'new-user' }; },
    deleteUser: async (uid) => calls.push(['delete', uid])
  };
  const db = {
    collection: (collection) => ({ doc: (id) => ({ create: async (data) => {
      if (failProfile) throw new Error('offline');
      calls.push(['profile', collection, id, data]);
    } }) }),
    runTransaction: async (fn) => fn({
      get: async () => ({ data: () => ({ count, expiresAt: Date.now() + 900000 }) }),
      set: (_ref, data) => { count = data.count; }
    })
  };
  const handler = createRegistrationHandler({ auth, db, managerKey: 'test-manager-key' });
  async function request(body = {}, method = 'POST') {
    const res = { statusCode: 200, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(data) { this.data = data; return this; } };
    await handler({ method, headers: {}, socket: { remoteAddress: '127.0.0.1' }, body: {
      name: 'Ana', email: 'ana@example.com', password: 'long-password', profile: 'estudante', ...body
    } }, res);
    return res;
  }
  return { request, calls };
}
test('students do not need a key and cannot inject role fields', async () => {
  const { request, calls } = setup();
  assert.equal((await request({ role: 'gestor', managerCode: 'anything' })).statusCode, 201);
  assert.deepEqual(calls[1][3], { name: 'Ana', profile: 'estudante' });
});
test('managers require the exact server key', async () => {
  const { request, calls } = setup();
  for (const managerCode of [undefined, '', 'wrong', 'test-manager-key ']) {
    assert.equal((await request({ profile: 'gestor', managerCode })).statusCode, 403);
  }
  assert.equal(calls.length, 0);
  assert.equal((await request({ profile: 'gestor', managerCode: 'test-manager-key' })).statusCode, 201);
  assert.equal(calls[1][3].profile, 'gestor');
});
test('unknown roles, malformed fields and unsupported methods are rejected', async () => {
  const { request, calls } = setup();
  assert.equal((await request({ profile: 'admin' })).statusCode, 400);
  assert.equal((await request({ password: 'short' })).statusCode, 400);
  assert.equal((await request({}, 'GET')).statusCode, 405);
  assert.equal(calls.length, 0);
});
test('the shared attempt limit blocks brute force before creating accounts', async () => {
  const { request, calls } = setup();
  for (let i = 0; i < 10; i++) await request({ profile: 'gestor', managerCode: 'wrong' });
  assert.equal((await request({ profile: 'gestor', managerCode: 'test-manager-key' })).statusCode, 429);
  assert.equal(calls.length, 0);
});
test('failed profile creation removes the newly created auth account', async () => {
  const { request, calls } = setup({ failProfile: true });
  assert.equal((await request()).statusCode, 503);
  assert.deepEqual(calls[1], ['delete', 'new-user']);
});
