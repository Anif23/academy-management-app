-- Counsellors get their own role (separate permissions from trainers).
UPDATE "users" u
SET "role" = 'COUNSELLOR'
FROM "employees" e
WHERE e."userId" = u."id" AND e."type" = 'COUNSELLOR' AND u."role" = 'STAFF';
