-- Run this after npm run db:push to create the super admin account
-- Replace the email, name and passwordHash below
-- Generate hash with: node -e "require('bcryptjs').hash('YOUR_PASSWORD', 12).then(h => console.log(h))"

INSERT INTO users (id, email, name, passwordHash, role, restaurantId, createdAt, updatedAt)
VALUES (
  'superadmin-1',
  'admin@admin.com',
  'Super Admin',
  '$2a$12$REPLACE_WITH_GENERATED_HASH',
  'SUPERADMIN',
  NULL,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  passwordHash = VALUES(passwordHash),
  role = 'SUPERADMIN';
