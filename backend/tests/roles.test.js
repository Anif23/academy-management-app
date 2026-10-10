const { ROLES, roleHasPermission } = require('../src/constants/roles');

describe('RBAC permission matrix', () => {
  test('ADMIN has full management permissions', () => {
    expect(roleHasPermission(ROLES.ADMIN, 'students:delete')).toBe(true);
    expect(roleHasPermission(ROLES.ADMIN, 'users:create')).toBe(true);
    expect(roleHasPermission(ROLES.ADMIN, 'fees:read')).toBe(true);
    expect(roleHasPermission(ROLES.ADMIN, 'fees:update')).toBe(true);
  });

  test('STAFF cannot delete students or manage users', () => {
    expect(roleHasPermission(ROLES.STAFF, 'students:delete')).toBe(false);
    expect(roleHasPermission(ROLES.STAFF, 'users:create')).toBe(false);
  });

  test('STAFF can read students but cannot update student records', () => {
    expect(roleHasPermission(ROLES.STAFF, 'students:read')).toBe(true);
    expect(roleHasPermission(ROLES.STAFF, 'students:update')).toBe(false);
    expect(roleHasPermission(ROLES.STAFF, 'attendance:create')).toBe(true);
  });

  test('STUDENT only has read-own permissions, never management ones', () => {
    expect(roleHasPermission(ROLES.STUDENT, 'profile:read-own')).toBe(true);
    expect(roleHasPermission(ROLES.STUDENT, 'attendance:read-own')).toBe(true);
    expect(roleHasPermission(ROLES.STUDENT, 'students:delete')).toBe(false);
    expect(roleHasPermission(ROLES.STUDENT, 'students:read')).toBe(false);
    expect(roleHasPermission(ROLES.STUDENT, 'attendance:manage')).toBe(false);
  });

  test('unknown role has no permissions', () => {
    expect(roleHasPermission('SOMETHING_MADE_UP', 'students:read')).toBe(false);
  });
});
