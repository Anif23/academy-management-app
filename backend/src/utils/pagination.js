const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.pageSize, 10) || DEFAULT_PAGE_SIZE));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

function buildPaginatedResult(data, total, page, pageSize) {
  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

module.exports = { parsePagination, buildPaginatedResult };
