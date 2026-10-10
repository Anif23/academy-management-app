const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const updatePermissionSchema = z.object({
  role: z.enum(Object.values(ROLES)),
  permission: z.string().min(1),
  enabled: z.boolean(),
});

module.exports = { updatePermissionSchema };
