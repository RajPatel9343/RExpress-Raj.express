import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message content required' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    const isStaff = isStaffRole(user.role);
    if (!isStaff && ticket.userId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: user.userId,
        senderRole: isStaff ? 'ADMIN' : 'CUSTOMER',
        message,
      },
    });

    // Update ticket updatedAt and reopen if customer replies to resolved ticket
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: !isStaff && ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to post message' }, { status: 500 });
  }
}
