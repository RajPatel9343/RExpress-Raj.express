import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser, isStaffRole } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const categorySlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    const query = searchParams.get('q');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const sort = searchParams.get('sort') || 'featured';
    const isFeatured = searchParams.get('featured') === 'true';
    const isTrending = searchParams.get('trending') === 'true';
    const isFlashSale = searchParams.get('flashSale') === 'true';
    const inStock = searchParams.get('inStock') === 'true';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    const where: any = {
      isPublished: true,
    };

    if (categorySlug) {
      where.OR = [
        { category: { slug: categorySlug } },
        { category: { parent: { slug: categorySlug } } },
      ];
    }

    if (brandSlug) {
      where.brand = { slug: brandSlug };
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isTrending) {
      where.isTrending = true;
    }

    if (isFlashSale) {
      where.isFlashSale = true;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (query && query.trim().length > 0) {
      const q = query.trim().toLowerCase();
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { sku: { contains: q } },
            { tags: { contains: q } },
            { brand: { name: { contains: q } } },
          ],
        },
      ];
    }

    // Determine sorting
    let orderBy: any = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'popular') {
      orderBy = { reviewCount: 'desc' };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, slug: true, logo: true },
          },
          variants: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !isStaffRole(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Staff role required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      sku,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      stock,
      categoryId,
      brandId,
      images,
      variants,
      attributes,
      isFeatured,
      isTrending,
      isFlashSale,
    } = body;

    if (!name || !sku || !price) {
      return NextResponse.json(
        { success: false, error: 'Product name, SKU and price are required.' },
        { status: 400 }
      );
    }

    const slug = slugify(name) + '-' + Math.random().toString(36).substring(2, 6);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description: description || '',
        shortDescription,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        stock: parseInt(stock || '0'),
        categoryId: categoryId || null,
        brandId: brandId || null,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isFlashSale: Boolean(isFlashSale),
        images: images && images.length > 0 ? {
          create: images.map((img: any, idx: number) => ({
            url: img.url,
            alt: img.alt || name,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        } : undefined,
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            name: v.name,
            sku: v.sku || `${sku}-${slugify(v.name)}`,
            price: parseFloat(v.price || price),
            stock: parseInt(v.stock || '0'),
            color: v.color,
            size: v.size,
            storage: v.storage,
          })),
        } : undefined,
        attributes: attributes && attributes.length > 0 ? {
          create: attributes.map((attr: any) => ({
            key: attr.key,
            value: attr.value,
          })),
        } : undefined,
      },
      include: {
        images: true,
        variants: true,
        category: true,
        brand: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
