const bcrypt = require('bcryptjs');
bcrypt.hash('admin@123', 10).then(h => {
  console.log(`INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_verified, created_at, updated_at) VALUES ('admin-id-123', 'admin@va-ra.com', '${h}', 'Admin', 'User', 'ADMIN', true, NOW(), NOW());`);
});
