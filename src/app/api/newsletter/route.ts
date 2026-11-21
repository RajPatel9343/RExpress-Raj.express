import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'A valid email address is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await prisma.newsletterSubscriber.upsert({
      where: { email: normalizedEmail },
      update: { isActive: true },
      create: { email: normalizedEmail },
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to NEXUS LUXE VIP updates!',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
