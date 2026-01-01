import { register } from './auth.mjs';
import { dbReady } from './database.mjs';

async function seed() {
  try {
    await dbReady;
    console.log('Database ready, creating admin user...');

    await register('admin@stable.com', 'admin123', 'Admin User', 'admin');

    console.log('✓ Admin user created successfully');
    console.log('  Email: admin@stable.com');
    console.log('  Password: admin123');
    console.log('\nYou can now login with these credentials.');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Admin user already exists. Skipping seed.');
      process.exit(0);
    } else {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  }
}

seed();
