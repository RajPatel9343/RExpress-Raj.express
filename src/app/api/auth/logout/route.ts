import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'ecommerce_session_token';

export async function POST() {
  try {
    cookies().delete(COOKIE_NAME);
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to log out.' },
      { status: 500 }
    );
  }
}
