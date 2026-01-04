import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Usage: node server/reset-password.mjs <email> <password>');
    process.exit(1);
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.VITE_SUPABASE_URL;

  if (!serviceRoleKey) {
    console.error('\nError: SUPABASE_SERVICE_ROLE_KEY not found in .env file');
    console.error('\nTo reset the password, you need to add the service role key to your .env file:');
    console.error('1. Go to https://supabase.com/dashboard/project/keizlwitpjunijxpukql/settings/api');
    console.error('2. Copy the "service_role" key (keep this secret!)');
    console.error('3. Add to .env file: SUPABASE_SERVICE_ROLE_KEY=your-key-here');
    console.error('\nAlternatively, you can reset the password via the Supabase Dashboard:');
    console.error('1. Go to https://supabase.com/dashboard/project/keizlwitpjunijxpukql/auth/users');
    console.error('2. Find the user and click "Reset Password"');
    process.exit(1);
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data: users, error: fetchError } = await adminClient.auth.admin.listUsers();

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === email);

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    const { data, error } = await adminClient.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (error) {
      console.error('Error updating password:', error);
      process.exit(1);
    }

    console.log(`✓ Password updated successfully for ${email}`);
    console.log(`  You can now login with:`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${newPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetPassword();
