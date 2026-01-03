import { getUserByEmail } from './database.mjs';

try {
  const user = await getUserByEmail('guido666@gmail.com');
  console.log('User found:', JSON.stringify(user, null, 2));
} catch (error) {
  console.error('Error checking user:', error.message);
}

process.exit(0);
