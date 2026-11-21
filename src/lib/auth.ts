import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import prisma from './prisma';
import { UserRole, UserSessionPayload } from '@/types';

const JWT_SECRET_STRING = process.env.JWT_SECRET || 'nexus-super-secure-ecommerce-key-2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'ecommerce_session_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as UserRole,
      name: payload.name as string,
    };
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  let token: string | undefined;
  try {
    const cookieStore = cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  } catch (err) {}
  if (!token) {
    try {
      const headerList = headers();
      const authHeader = headerList.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    } catch (err) {}
  }
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, role: true, name: true, isVerified: true, isBlocked: true },
  });
  if (!user || user.isBlocked) return null;
  return {
    userId: user.id,
    email: user.email,
    role: user.role as UserRole,
    name: user.name,
  };
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  await prisma.userSession.deleteMany({ where: { userId } });
}

export function isStaffRole(role: string): boolean {
  return [
    'SUPER_ADMIN',
    'ADMIN',
    'PRODUCT_MANAGER',
    'ORDER_MANAGER',
    'INVENTORY_MANAGER',
    'MARKETING_MANAGER',
    'SUPPORT_AGENT',
    'ACCOUNTANT',
  ].includes(role);
}

export function isAdminRole(role: string): boolean {
  return ['SUPER_ADMIN', 'ADMIN'].includes(role);
}
