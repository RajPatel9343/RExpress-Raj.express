import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { name, description, image, parentId, isFeatured } = await req.json();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        isFeatured: Boolean(isFeatured),
      },
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
