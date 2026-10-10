const prisma = require('../config/prisma');
const redis = require('../config/redis');
const { ROLES, PERMISSIONS: STATIC_PERMISSIONS, CRUD_MODULES } = require('../constants/roles');

// Multiple backend instances (behind a load balancer) each keep their own
// in-memory permissions cache for speed. When one instance changes a
// permission, it publishes on this channel so every instance — including
// itself — reloads, instead of other instances serving stale permissions
// until they happen to restart.
const INVALIDATE_CHANNEL = 'permissions:invalidate';

const ALL_ROLES = [ROLES.ADMIN, ROLES.STAFF, ROLES.COUNSELLOR, ROLES.STUDENT];

/**
 * Human-readable grouping for the admin permissions UI — purely cosmetic,
 * doesn't affect enforcement. Any permission key not listed here still
 * works, it just falls into "Other" in the UI.
 */
const PERMISSION_GROUPS = [
  { label: 'Users & Staff', keys: ['users:read', 'users:create', 'users:update', 'users:delete', 'staff:read', 'staff:create', 'staff:update', 'staff:delete'] },
  { label: 'Students', keys: ['students:read', 'students:create', 'students:update', 'students:delete'] },
  { label: 'Courses', keys: ['courses:read', 'courses:create', 'courses:update', 'courses:delete', 'courses:read-own'] },
  { label: 'Batches', keys: ['batches:read', 'batches:create', 'batches:update', 'batches:delete'] },
  { label: 'Walk-ins & Admissions', keys: ['walkins:read', 'walkins:create', 'walkins:update', 'walkins:delete'] },
  { label: 'Fees', keys: ['fees:read', 'fees:create', 'fees:update', 'fees:delete', 'fees:read-own'] },
  { label: 'Attendance', keys: ['attendance:read', 'attendance:create', 'attendance:update', 'attendance:read-own'] },
  { label: 'Tasks', keys: ['tasks:read', 'tasks:create', 'tasks:update', 'tasks:delete', 'tasks:read-own'] },
  { label: 'Class Reports', keys: ['classreports:read', 'classreports:create', 'classreports:update', 'classreports:delete'] },
  { label: 'Performance', keys: ['performance:read', 'performance:create', 'performance:update', 'performance:delete', 'performance:read-own'] },
  { label: 'Reports', keys: ['reports:read'] },
  { label: 'Academy & Branding', keys: ['academy:manage', 'branding:manage', 'testimonials:manage', 'faqs:manage', 'announcements:manage'] },
  { label: 'General', keys: ['dashboard:read', 'search:read', 'profile:read-own'] },
];

/** Every permission key that exists anywhere in the static defaults — the canonical catalog. */
function allKnownPermissions() {
  const set = new Set();
  Object.values(STATIC_PERMISSIONS).forEach((list) => list.forEach((p) => set.add(p)));
  return Array.from(set);
}

// In-memory cache so `roleHasPermission` (called on every single
// permission-gated request) is a synchronous Set lookup, not a DB round
// trip. Populated at boot via `initialize()` and refreshed after any
// admin write.
let cache = null;

/**
 * Older databases stored one `<module>:manage` row per role. Those are
 * expanded into separate read/create/update/delete rows (once — after the
 * expansion no `:manage` rows remain for these modules), so whatever an
 * admin had granted keeps working, just with finer control now.
 */
async function expandLegacyManageRows() {
  const legacyKeys = [...CRUD_MODULES, 'attendance'].map((m) => `${m}:manage`);
  const legacy = await prisma.rolePermission.findMany({ where: { permission: { in: legacyKeys } } });
  if (legacy.length === 0) return;

  const rows = [];
  legacy.forEach(({ role, permission }) => {
    const module = permission.split(':')[0];
    const actions = module === 'attendance' ? ['read', 'create', 'update'] : ['read', 'create', 'update', 'delete'];
    actions.forEach((action) => rows.push({ role, permission: `${module}:${action}` }));
  });
  await prisma.rolePermission.createMany({ data: rows, skipDuplicates: true });
  await prisma.rolePermission.deleteMany({ where: { id: { in: legacy.map((l) => l.id) } } });
}

async function ensureBootstrapped() {
  await expandLegacyManageRows();

  // Seed defaults per role, only for roles that have no rows at all — so a
  // newly introduced role (e.g. COUNSELLOR) gets sensible defaults without
  // touching whatever an admin already configured for existing roles.
  const existing = await prisma.rolePermission.groupBy({ by: ['role'], _count: { _all: true } });
  const seeded = new Set(existing.map((e) => e.role));

  const rows = [];
  Object.entries(STATIC_PERMISSIONS).forEach(([role, permissions]) => {
    if (seeded.has(role)) return;
    permissions.forEach((permission) => rows.push({ role, permission }));
  });
  // ADMIN always has every permission that exists, so a newly added
  // permission key never leaves an existing admin without access to it.
  (STATIC_PERMISSIONS[ROLES.ADMIN] || []).forEach((permission) => rows.push({ role: ROLES.ADMIN, permission }));
  if (rows.length > 0) {
    await prisma.rolePermission.createMany({ data: rows, skipDuplicates: true });
  }
}

async function loadCache() {
  const rows = await prisma.rolePermission.findMany();
  const next = Object.fromEntries(ALL_ROLES.map((role) => [role, new Set()]));
  rows.forEach((row) => {
    if (!next[row.role]) next[row.role] = new Set();
    next[row.role].add(row.permission);
  });
  cache = next;
}

async function initialize() {
  await ensureBootstrapped();
  await loadCache();
  // Single-instance deployments (no REDIS_URL) get a no-op subscribe — fine,
  // this instance's own `setRolePermission` already reloads its own cache.
  redis.subscribe(INVALIDATE_CHANNEL, () => {
    loadCache().catch(() => {
      // A transient DB hiccup here just means this instance keeps serving
      // its previous (still valid) cache until the next successful reload.
    });
  });
}

/** Synchronous — safe to call on every request once `initialize()` has run at boot. */
function roleHasPermission(role, permission) {
  // Hard-coded, not DB-overridable: ADMIN can never lose access to the
  // permissions page itself, however the DB state gets edited — otherwise
  // a bad toggle (or corrupted row) could permanently lock everyone out
  // of the only place that could fix it.
  if (role === ROLES.ADMIN && permission === 'permissions:manage') return true;

  if (!cache) {
    // Extremely defensive fallback: if somehow called before boot
    // finished, don't silently allow/deny everything — fall back to the
    // static file so the app still behaves correctly.
    return Boolean(STATIC_PERMISSIONS[role]?.includes(permission));
  }
  return Boolean(cache[role]?.has(permission));
}

/** Every permission key currently granted to a role — sent to the frontend so it can hide UI the role can't use. */
function permissionsForRole(role) {
  if (!cache) return [...(STATIC_PERMISSIONS[role] || [])];
  const set = new Set(cache[role] || []);
  if (role === ROLES.ADMIN) set.add('permissions:manage');
  return Array.from(set);
}

async function getPermissionMatrix() {
  if (!cache) await loadCache();
  const roles = ALL_ROLES;
  const known = allKnownPermissions();

  const groups = PERMISSION_GROUPS.map((group) => ({
    label: group.label,
    permissions: group.keys
      .filter((key) => known.includes(key))
      .map((key) => ({
        key,
        roles: Object.fromEntries(roles.map((role) => [role, cache[role]?.has(key) ?? false])),
      })),
  }));

  // Anything not covered by a named group still shows up, under "Other".
  const grouped = new Set(PERMISSION_GROUPS.flatMap((g) => g.keys));
  const leftover = known.filter((k) => !grouped.has(k));
  if (leftover.length > 0) {
    groups.push({
      label: 'Other',
      permissions: leftover.map((key) => ({
        key,
        roles: Object.fromEntries(roles.map((role) => [role, cache[role]?.has(key) ?? false])),
      })),
    });
  }

  return groups;
}

async function setRolePermission(role, permission, enabled) {
  if (!Object.values(ROLES).includes(role)) {
    throw new Error(`Unknown role: ${role}`);
  }
  if (enabled) {
    await prisma.rolePermission.upsert({
      where: { role_permission: { role, permission } },
      update: {},
      create: { role, permission },
    });
  } else {
    await prisma.rolePermission.deleteMany({ where: { role, permission } });
  }
  await loadCache();
  // Tell every other instance to reload too (harmless if we're the only one).
  await redis.publish(INVALIDATE_CHANNEL, `${role}:${permission}`);
}

module.exports = {
  initialize,
  roleHasPermission,
  permissionsForRole,
  getPermissionMatrix,
  setRolePermission,
  allKnownPermissions,
};
