const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../constants/roles');
const permissionsService = require('../services/permissionsService');

const getMatrix = asyncHandler(async (req, res) => {
  const data = await permissionsService.getPermissionMatrix();
  res.json({ success: true, data });
});

const update = asyncHandler(async (req, res) => {
  const { role, permission, enabled } = req.body;

  // Hard safety rail, not admin-configurable: ADMIN must always retain
  // the one permission that gates this very page, or a misclick here
  // could permanently lock every admin account out of fixing it again.
  if (role === ROLES.ADMIN && permission === 'permissions:manage' && !enabled) {
    throw ApiError.badRequest(
      "Admin can't remove its own access to permission management — that would lock everyone out of this page.",
      'CANNOT_REMOVE_SELF_ACCESS',
    );
  }

  await permissionsService.setRolePermission(role, permission, enabled);
  const data = await permissionsService.getPermissionMatrix();
  res.json({ success: true, data, message: `${role} ${enabled ? 'granted' : 'revoked'}: ${permission}` });
});

module.exports = { getMatrix, update };
