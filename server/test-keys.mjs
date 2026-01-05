import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...\n');
console.log('URL:', url);
console.log('Anon Key (first 20 chars):', anonKey?.substring(0, 20));
console.log('Service Key (first 20 chars):', serviceKey?.substring(0, 20));

console.log('\n--- Testing with Anon Key ---');
try {
  const anonClient = createClient(url, anonKey);
  const { data, error } = await anonClient.from('profiles').select('count').limit(1);
  if (error) {
    console.log('Anon Key Error:', error.message);
  } else {
    console.log('Anon Key: SUCCESS');
  }
} catch (err) {
  console.log('Anon Key Exception:', err.message);
}

console.log('\n--- Testing with Service Role Key ---');
try {
  const serviceClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  const { data, error } = await serviceClient.from('profiles').select('count').limit(1);
  if (error) {
    console.log('Service Key Error:', error.message);
  } else {
    console.log('Service Key: SUCCESS');
  }
} catch (err) {
  console.log('Service Key Exception:', err.message);
}

console.log('\n--- Testing Auth with Anon Key ---');
try {
  const authClient = createClient(url, anonKey);
  const { data, error } = await authClient.auth.admin.listUsers();
  if (error) {
    console.log('Auth Admin Error:', error.message);
  } else {
    console.log('Auth Admin: SUCCESS - found', data.users.length, 'users');
  }
} catch (err) {
  console.log('Auth Admin Exception:', err.message);
}

process.exit(0);
