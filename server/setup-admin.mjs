import { register } from './auth.mjs';
import { dbReady, getUserByEmail } from './database.mjs';

async function setupAdmin() {
  try {
    await dbReady;
    console.log('Database ready, setting up super admin...');

    const existingUser = await getUserByEmail('guido666@gmail.com');

    if (existingUser) {
      console.log('Super admin user already exists.');
      console.log('  Email: guido666@gmail.com');
      process.exit(0);
    }

    await register('guido666@gmail.com', 'Westc0mbe', 'Guido Administrator', 'admin');

    console.log('✓ Super admin user created successfully');
    console.log('  Email: guido666@gmail.com');
    console.log('  Password: Westc0mbe');
    console.log('  Role: admin');
    console.log('\nYou can now login with these credentials.');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();
