import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendEmail, passwordResetEmailHtml } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const genericMsg = { success: true, message: 'If this email is registered, you will receive a password reset link shortly.' };

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return NextResponse.json(genericMsg);
    }

    // Rate limit: check if there's a recent token (last 5 minutes)
    const recentToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        usedAt: null,
      },
    });

    if (recentToken) {
      return NextResponse.json(genericMsg); // Silently rate-limit
    }

    // Delete any old unused tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    // Generate secure token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your Rexpresso password',
      html: passwordResetEmailHtml(resetUrl, user.name),
    });

    return NextResponse.json(genericMsg);
  } catch (err) {
    console.error('forgot-password error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
