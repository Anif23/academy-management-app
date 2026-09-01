const { z } = require('zod');

const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).optional(),
    search: z.string().trim().optional(),
    sortBy: z.string().optional(),
    sortDir: z.enum(['asc', 'desc']).optional(),
  })
  .passthrough();

const idParamSchema = z.object({
  id: z.string().min(1, 'Id is required.'),
});

module.exports = { paginationQuerySchema, idParamSchema };
