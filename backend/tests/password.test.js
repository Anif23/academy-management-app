const { hashPassword, comparePassword } = require('../src/utils/password');

describe('password hashing', () => {
  test('hashes a password to something other than plaintext', async () => {
    const hash = await hashPassword('correct horse battery staple');
    expect(hash).not.toBe('correct horse battery staple');
    expect(hash.length).toBeGreaterThan(20);
  });

  test('comparePassword succeeds for the correct password', async () => {
    const hash = await hashPassword('my-secret-password');
    await expect(comparePassword('my-secret-password', hash)).resolves.toBe(true);
  });

  test('comparePassword fails for an incorrect password', async () => {
    const hash = await hashPassword('my-secret-password');
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });

  test('hashing the same password twice produces different hashes (salted)', async () => {
    const [a, b] = await Promise.all([hashPassword('same-input'), hashPassword('same-input')]);
    expect(a).not.toBe(b);
  });
});
