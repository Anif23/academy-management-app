process.env.JWT_ACCESS_SECRET = 'test_access_secret';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
process.env.REDIS_URL = '';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
process.env.FRONTEND_URL = 'http://localhost:5173';

const bcrypt = require('bcryptjs');

// The Prisma query engine binary can't be fetched in this environment (see
// README — network-restricted CI/sandboxes), so integration tests mock the
// Prisma client at the module boundary and drive the REAL Express app
// (real routing, real middleware, real cookie handling, real error
// formatting) against that mock. This is a standard, legitimate pattern —
// full end-to-end tests against a live Postgres run separately in CI/CD
// where Prisma's engine can actually be downloaded.
let mockUser;

jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn((args) => Promise.resolve(mockUser && mockUser.email === args.where.email ? mockUser : args.where.id === mockUser?.id ? mockUser : null)),
  },
  refreshToken: {
    create: jest.fn(() => Promise.resolve({})),
    findUnique: jest.fn(() => Promise.resolve(null)),
    updateMany: jest.fn(() => Promise.resolve({})),
  },
}));

const request = require('supertest');
const app = require('../src/app');

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    mockUser = {
      id: 'user_admin_1',
      name: 'Test Admin',
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash('correct-password', 10),
      role: 'ADMIN',
      department: 'Ops',
      phone: '9999999999',
      status: 'ACTIVE',
      avatar: '',
      employee: null,
      student: null,
    };
  });

  test('rejects a request missing the password field with a 400 and a clear message', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });

  test('rejects an unknown email with a generic invalid-credentials message (no user enumeration)', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nobody@test.com', password: 'whatever' });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
  });

  test('rejects a correct email with the wrong password using the SAME generic message', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('INVALID_CREDENTIALS');
  });

  test('logs in successfully with correct credentials and sets an httpOnly access-token cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'correct-password' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@test.com');
    expect(res.body.data.passwordHash).toBeUndefined(); // never leak the hash

    const cookies = res.headers['set-cookie'].join(';');
    expect(cookies).toContain('access_token=');
    expect(cookies.toLowerCase()).toContain('httponly');
  });

  test('rejects login for a deactivated account', async () => {
    mockUser.status = 'INACTIVE';
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'correct-password' });
    expect(res.status).toBe(403);
    expect(res.body.errorCode).toBe('ACCOUNT_INACTIVE');
  });
});

describe('protected routes without authentication', () => {
  test('GET /api/students without a token returns 401', async () => {
    const res = await request(app).get('/api/students');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('unknown route returns a consistent 404 JSON shape', async () => {
    const res = await request(app).get('/api/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe('ROUTE_NOT_FOUND');
  });
});
