import jwt from 'jsonwebtoken';
import { getUserByEmail, getUserById } from './database.mjs';
import { supabase, supabaseAuth } from './supabase.mjs';
import { JWT_SECRET } from './middleware/auth.mjs';

export async function register(email, password, fullName, role = 'user') {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role
    }
  });

  if (error) throw error;

  if (data.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role: role,
        is_active: true
      });

    if (profileError) throw profileError;

    const profile = await getUserById(data.user.id);
    return profile;
  }

  throw new Error('Failed to create user');
}

export async function login(email, password) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error('Invalid email or password');
  }

  if (!data.user) {
    throw new Error('Invalid email or password');
  }

  const profile = await getUserById(data.user.id);
  if (!profile) {
    throw new Error('User profile not found');
  }

  const token = jwt.sign(
    { id: profile.id, email: profile.email, role: profile.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, user: profile };
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
