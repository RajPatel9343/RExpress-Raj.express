import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const where = isStaffRole(user.role) ? {} : { userId: user.userId };

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { subject, category = 'GENERAL', priority = 'MEDIUM', message } = await req.json();

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: 'Subject and message are required' }, { status: 400 });
    }

    const ticketNumber = `TCK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: user.userId,
        subject,
        category,
        priority,
        status: 'OPEN',
        messages: {
          create: [
            {
              senderId: user.userId,
              senderRole: 'CUSTOMER',
              message,
            },
          ],
        },
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Support ticket submitted successfully',
      data: ticket,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to create ticket' }, { status: 500 });
  }
}
