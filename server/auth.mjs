import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserById } from './database.mjs';
import { JWT_SECRET } from './middleware/auth.mjs';

export async function register(email, password, fullName, role = 'staff') {
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists with this email');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    email,
    password_hash: passwordHash,
    full_name: fullName,
    role,
    phone: null,
  });

  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function login(email, password) {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  const { password_hash, ...userWithoutPassword } = user;
  return { token, user: userWithoutPassword };
}

export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getUserById(decoded.id);
    if (!user) {
      throw new Error('User not found');
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
