import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signSessionToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'ecommerce_session_token';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone ? phone.trim() : null,
        role: 'CUSTOMER',
        isVerified: true,
      },
    });

    // Create session token
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: 'CUSTOMER',
    });

    // Save session in DB
    await prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers.get('user-agent'),
        ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      },
    });

    // Set HTTP-only Cookie
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
      message: 'Account registered successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
