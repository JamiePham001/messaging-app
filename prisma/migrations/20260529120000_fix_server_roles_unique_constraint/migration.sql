-- Drop the overly strict one-role-per-server unique index
DROP INDEX IF EXISTS "ServerRoles_serverId_key";

-- Keep role names unique within each server
CREATE UNIQUE INDEX "ServerRoles_serverId_role_key" ON "ServerRoles"("serverId", "role");
