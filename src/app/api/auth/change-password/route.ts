import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, verifyPassword, hashPassword, invalidateUserSessions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash: newHash },
    });

    // Invalidate all sessions for security
    await invalidateUserSessions(session.userId);

    return NextResponse.json({ success: true, message: 'Password changed successfully. Please sign in again.' });
  } catch (err) {
    console.error('change-password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
