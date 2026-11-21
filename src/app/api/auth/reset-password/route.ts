import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { hashPassword, invalidateUserSessions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired reset link. Please request a new one.' }, { status: 400 });
    }

    if (resetToken.usedAt) {
      return NextResponse.json({ error: 'This reset link has already been used.' }, { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({ error: 'This reset link has expired. Please request a new one.' }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    await invalidateUserSessions(resetToken.userId);

    return NextResponse.json({ success: true, message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    console.error('reset-password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
