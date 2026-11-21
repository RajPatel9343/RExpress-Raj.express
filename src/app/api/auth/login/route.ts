import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { UserRole } from '@/types';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'ecommerce_session_token';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    // Record session
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers.get('user-agent'),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    // Set HTTP cookie
    cookies().set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
