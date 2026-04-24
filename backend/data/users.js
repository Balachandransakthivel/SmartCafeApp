// Ensure we export real bcrypt hashes or raw passwords if the model automatically hashes.
// Since we have a pre-save hook in the User model, we'll supply plain text passwords and let Mongoose hash them on insert!
// Wait - insertMany skips the pre-save hook. Let's use plain passwords, but we must use .save() if we want the pre-hook, or we can use bcrypt here.
// Let's use bcrypt here so we can safely use insertMany.

const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Café Manager',
    email: 'admin@smartcafe.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    phone: '+91 98765 43211'
  },
  {
    name: 'Demo User',
    email: 'demo@smartcafe.com',
    password: bcrypt.hashSync('demo123', 10),
    role: 'customer',
    phone: '+91 98765 43210'
  }
];

module.exports = users;
