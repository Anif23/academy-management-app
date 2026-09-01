const { requirePermission, requireRole } = require('../src/middleware/permissionMiddleware');
const ApiError = require('../src/utils/ApiError');

function mockRes() {
  return {};
}

describe('requirePermission middleware', () => {
  test('calls next() with no error when the role has the permission', () => {
    const req = { user: { role: 'ADMIN' } };
    const next = jest.fn();
    requirePermission('students:delete')(req, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('calls next(ApiError 403) when the role lacks every listed permission', () => {
    const req = { user: { role: 'STUDENT' } };
    const next = jest.fn();
    requirePermission('students:delete', 'students:update')(req, mockRes(), next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(403);
  });

  test('passes if the role has ANY of multiple listed permissions', () => {
    const req = { user: { role: 'STAFF' } };
    const next = jest.fn();
    requirePermission('students:delete', 'students:read')(req, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('calls next(ApiError 401) when there is no authenticated user at all', () => {
    const req = {};
    const next = jest.fn();
    requirePermission('students:read')(req, mockRes(), next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(401);
  });
});

describe('requireRole middleware', () => {
  test('allows a listed role through', () => {
    const req = { user: { role: 'ADMIN' } };
    const next = jest.fn();
    requireRole('ADMIN', 'STAFF')(req, mockRes(), next);
    expect(next).toHaveBeenCalledWith();
  });

  test('blocks a role not in the list', () => {
    const req = { user: { role: 'STUDENT' } };
    const next = jest.fn();
    requireRole('ADMIN', 'STAFF')(req, mockRes(), next);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
  });
});
