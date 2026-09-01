process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/test';

const { signAccessToken, verifyAccessToken, generateRefreshToken, hashRefreshToken } = require('../src/utils/tokens');

describe('access tokens', () => {
  test('signs a token that verifies back to the same user id and role', () => {
    const token = signAccessToken({ id: 'user_123', role: 'ADMIN' });
    const payload = verifyAccessToken(token);
    expect(payload.sub).toBe('user_123');
    expect(payload.role).toBe('ADMIN');
  });

  test('throws when verifying a tampered token', () => {
    const token = signAccessToken({ id: 'user_123', role: 'ADMIN' });
    const tampered = token.slice(0, -2) + 'xx';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});

describe('refresh tokens', () => {
  test('generates a sufficiently long random opaque token', () => {
    const token = generateRefreshToken();
    expect(token).toHaveLength(96); // 48 bytes as hex
  });

  test('two generated refresh tokens are never equal', () => {
    expect(generateRefreshToken()).not.toBe(generateRefreshToken());
  });

  test('hashing the same token twice is deterministic (needed for DB lookup)', () => {
    const token = generateRefreshToken();
    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  test('different tokens hash differently', () => {
    expect(hashRefreshToken('token-a')).not.toBe(hashRefreshToken('token-b'));
  });
});
