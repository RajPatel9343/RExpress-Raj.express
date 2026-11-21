import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const { reason } = await req.json().catch(() => ({ reason: 'Policy violation' }));

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (targetUser.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot block the Super Admin account' }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: params.id },
        data: { isBlocked: true, blockedAt: new Date(), blockedReason: reason || 'Policy violation' },
      }),
      prisma.userSession.deleteMany({ where: { userId: params.id } }),
      prisma.adminActivityLog.create({
        data: {
          adminId: session.userId,
          action: 'BLOCK_USER',
          entity: 'User',
          entityId: params.id,
          details: JSON.stringify({ reason, targetEmail: targetUser.email }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: `User blocked successfully.` });
  } catch (err) {
    console.error('block-user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Super Admin only' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: params.id },
        data: { isBlocked: false, blockedAt: null, blockedReason: null },
      }),
      prisma.adminActivityLog.create({
        data: {
          adminId: session.userId,
          action: 'UNBLOCK_USER',
          entity: 'User',
          entityId: params.id,
          details: JSON.stringify({ targetEmail: targetUser.email }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: `User unblocked successfully.` });
  } catch (err) {
    console.error('unblock-user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

