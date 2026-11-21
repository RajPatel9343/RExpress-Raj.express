import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clean existing records if any
  await prisma.adminActivityLog.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.reviewImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.storeSeller.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.store.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userAddress.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();

  // 1. Warehouses
  console.log('📦 Creating Warehouses...');
  const whMum = await prisma.warehouse.create({
    data: {
      name: 'Mumbai Central Logistics Hub',
      code: 'WH-MUM-01',
      address: 'Plot 42, MIDC Industrial Area, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400093',
      isActive: true,
    },
  });

  const whBlr = await prisma.warehouse.create({
    data: {
      name: 'Bengaluru Tech Logistics Hub',
      code: 'WH-BLR-02',
      address: 'Hosur Road, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560100',
      isActive: true,
    },
  });

  const whDel = await prisma.warehouse.create({
    data: {
      name: 'Delhi NCR Express Center',
      code: 'WH-DEL-03',
      address: 'Udyog Vihar Phase 4',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122016',
      isActive: true,
    },
  });

  // 2. Users
  console.log('👤 Creating Users...');
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123456', salt);
  const customerPasswordHash = await bcrypt.hash('Customer@123', salt);

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Raj Patel',
      email: 'superadmin@rexpresso.com',
      passwordHash: adminPasswordHash,
      phone: '+91 98765 43210',
      role: 'SUPER_ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Priya Patel (Operations Admin)',
      email: 'admin@nexuscommerce.com',
      passwordHash: adminPasswordHash,
      phone: '+91 98765 12345',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Arjun Mehta',
      email: 'customer@example.com',
      passwordHash: customerPasswordHash,
      phone: '+91 91234 56789',
      role: 'CUSTOMER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
    },
  });

  // Customer Address
  const customerAddress = await prisma.userAddress.create({
    data: {
      userId: customer.id,
      fullName: 'Arjun Mehta',
      phone: '+91 91234 56789',
      addressLine1: 'Flat 402, Skyline Residency',
      addressLine2: 'Road No. 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500034',
      country: 'India',
      addressType: 'HOME',
      isDefault: true,
      deliveryNotes: 'Leave with security guard if not available',
    },
  });

  // 3. Categories
  console.log('🏷️ Creating Categories...');
  const catElectronics = await prisma.category.create({
    data: {
      name: 'Electronics & Gadgets',
      slug: 'electronics',
      description: 'Cutting edge electronics, smart devices, audio gear, and laptops.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: 'Audio & Headphones',
      slug: 'audio-headphones',
      description: 'Studio monitors, wireless noise cancelling headphones and earbuds.',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      parentId: catElectronics.id,
      isFeatured: true,
      sortOrder: 2,
    },
  });

  const catSmartphones = await prisma.category.create({
    data: {
      name: 'Smartphones & Accessories',
      slug: 'smartphones',
      description: 'Flagship mobile devices, cases, wireless chargers and accessories.',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02596?auto=format&fit=crop&w=800&q=80',
      parentId: catElectronics.id,
      isFeatured: true,
      sortOrder: 3,
    },
  });

  const catWearables = await prisma.category.create({
    data: {
      name: 'Wearables & Smartwatches',
      slug: 'wearables',
      description: 'Smart watches, fitness trackers, health monitors.',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      parentId: catElectronics.id,
      isFeatured: true,
      sortOrder: 4,
    },
  });

  const catFashion = await prisma.category.create({
    data: {
      name: 'Fashion & Luxury',
      slug: 'fashion',
      description: 'Curated premium fashion, designer apparel, footwear and accessories.',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      sortOrder: 5,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: 'Home & Modern Living',
      slug: 'home-living',
      description: 'Architectural furniture, smart lighting, kitchenware and home accents.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      sortOrder: 6,
    },
  });

  // 4. Brands
  console.log('🏢 Creating Brands...');
  const brandSony = await prisma.brand.create({
    data: {
      name: 'Sony',
      slug: 'sony',
      logo: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80',
      description: 'Japanese multinational entertainment and electronics leader.',
      website: 'https://www.sony.co.in',
      isFeatured: true,
    },
  });

  const brandApple = await prisma.brand.create({
    data: {
      name: 'Apple',
      slug: 'apple',
      logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80',
      description: 'Innovator of iPhone, iPad, Mac, and Apple Watch.',
      website: 'https://www.apple.com/in',
      isFeatured: true,
    },
  });

  const brandBose = await prisma.brand.create({
    data: {
      name: 'Bose',
      slug: 'bose',
      logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80',
      description: 'Pioneers in high-end audio and noise reduction acoustics.',
      website: 'https://www.boseindia.com',
      isFeatured: true,
    },
  });

  const brandNike = await prisma.brand.create({
    data: {
      name: 'Nike',
      slug: 'nike',
      logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=200&q=80',
      description: 'World premier athletic footwear and apparel.',
      website: 'https://www.nike.com/in',
      isFeatured: true,
    },
  });

  const brandDyson = await prisma.brand.create({
    data: {
      name: 'Dyson',
      slug: 'dyson',
      logo: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=200&q=80',
      description: 'Engineering cutting-edge air purifiers, vacuums, and hair care.',
      website: 'https://www.dyson.in',
      isFeatured: true,
    },
  });

  // 5. Products
  console.log('🛍️ Creating Products & Variants...');

  // Product 1: Sony WH-1000XM5
  const prodSony = await prisma.product.create({
    data: {
      name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      slug: 'sony-wh-1000xm5-wireless-headphones',
      sku: 'SNY-WH1000XM5-BLK',
      description: 'The Sony WH-1000XM5 headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and exceptional call quality. Newly developed 30mm driver unit with carbon fiber composite material produces exquisite high-resolution audio.',
      shortDescription: 'Industry-leading noise cancellation with two processors and 8 microphones. Up to 30-hour battery life.',
      price: 29990,
      compareAtPrice: 34990,
      costPrice: 22000,
      stock: 45,
      lowStockThreshold: 8,
      brandId: brandSony.id,
      categoryId: catAudio.id,
      rating: 4.8,
      reviewCount: 142,
      isPublished: true,
      isFeatured: true,
      isTrending: true,
      isFlashSale: true,
      flashSaleEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      weight: 0.25,
      dimensions: '22 x 18 x 7 cm',
      warranty: '1 Year Manufacturer Domestic Warranty',
      manufacturer: 'Sony Corporation, Tokyo, Japan',
      tags: 'headphones,anc,sony,wireless,audio,bluetooth,hi-res',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
            alt: 'Sony WH-1000XM5 Black Front View',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
            alt: 'Sony WH-1000XM5 Audio Driver Profile',
            isPrimary: false,
            sortOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
            alt: 'Sony WH-1000XM5 Lifestyle',
            isPrimary: false,
            sortOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'Black',
            sku: 'SNY-WH1000XM5-BLK-STD',
            price: 29990,
            stock: 25,
            color: 'Black',
          },
          {
            name: 'Silver / Platinum',
            sku: 'SNY-WH1000XM5-SLV-STD',
            price: 29990,
            stock: 20,
            color: 'Silver',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'Driver Unit', value: '30mm, Carbon Fiber Composite' },
          { key: 'Battery Life', value: 'Up to 30 hours (NC ON)' },
          { key: 'Fast Charging', value: '3 mins for 3 hours playback' },
          { key: 'Connectivity', value: 'Bluetooth 5.2, LDAC, 3.5mm Aux' },
        ],
      },
    },
  });

  // Product 2: Apple iPhone 15 Pro Max
  const prodApple = await prisma.product.create({
    data: {
      name: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
      slug: 'apple-iphone-15-pro-max-256gb',
      sku: 'APL-IPH15PM-256-NT',
      description: 'iPhone 15 Pro Max forged in aerospace-grade titanium, featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x optical zoom on the Telephoto camera.',
      shortDescription: 'Aerospace-grade titanium design, A17 Pro chip, 48MP main camera with 5x optical zoom.',
      price: 154900,
      compareAtPrice: 159900,
      costPrice: 135000,
      stock: 18,
      lowStockThreshold: 4,
      brandId: brandApple.id,
      categoryId: catSmartphones.id,
      rating: 4.9,
      reviewCount: 388,
      isPublished: true,
      isFeatured: true,
      isTrending: true,
      weight: 0.221,
      dimensions: '15.99 x 7.67 x 0.83 cm',
      warranty: '1 Year Apple India Warranty with AppleCare Support',
      manufacturer: 'Apple Inc., Cupertino, California',
      tags: 'apple,iphone,smartphone,5g,titanium,flagship',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80',
            alt: 'Apple iPhone 15 Pro Max Natural Titanium',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02596?auto=format&fit=crop&w=1000&q=80',
            alt: 'Apple iPhone Screen View',
            isPrimary: false,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'Natural Titanium / 256GB',
            sku: 'APL-IP15PM-256-NAT',
            price: 154900,
            stock: 8,
            color: 'Natural Titanium',
            storage: '256GB',
          },
          {
            name: 'Blue Titanium / 512GB',
            sku: 'APL-IP15PM-512-BLU',
            price: 174900,
            stock: 10,
            color: 'Blue Titanium',
            storage: '512GB',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'Display', value: '6.7-inch Super Retina XDR OLED 120Hz' },
          { key: 'Chipset', value: 'A17 Pro (3nm architecture)' },
          { key: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto' },
          { key: 'Port', value: 'USB-C with USB 3 speeds (up to 10Gb/s)' },
        ],
      },
    },
  });

  // Product 3: Apple Watch Ultra 2
  const prodWatch = await prisma.product.create({
    data: {
      name: 'Apple Watch Ultra 2 GPS + Cellular Titanium Case',
      slug: 'apple-watch-ultra-2-gps-cellular',
      sku: 'APL-WTCH-ULT2-ORG',
      description: 'The most rugged and capable Apple Watch pushes the limits again. Featuring the all-new S9 SiP, a magical new double-tap gesture, and our brightest display ever at 3000 nits. Designed for extreme environments and endurance athletes.',
      shortDescription: '49mm titanium case, 3000 nits bright display, precision dual-frequency GPS, up to 72 hours in Low Power Mode.',
      price: 89900,
      compareAtPrice: 89900,
      costPrice: 74000,
      stock: 12,
      lowStockThreshold: 3,
      brandId: brandApple.id,
      categoryId: catWearables.id,
      rating: 4.9,
      reviewCount: 94,
      isPublished: true,
      isFeatured: true,
      weight: 0.061,
      dimensions: '49 x 44 x 14.4 mm',
      warranty: '1 Year Manufacturer Warranty',
      manufacturer: 'Apple Inc.',
      tags: 'smartwatch,apple,ultra,gps,fitness,titanium',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
            alt: 'Apple Watch Ultra Titanium',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'Orange Alpine Loop',
            sku: 'APL-WTCH-ULT2-ALP-ORG',
            price: 89900,
            stock: 6,
            color: 'Orange',
            size: 'Medium (145-190mm)',
          },
          {
            name: 'Blue Ocean Band',
            sku: 'APL-WTCH-ULT2-OCN-BLU',
            price: 89900,
            stock: 6,
            color: 'Blue',
            size: 'One Size',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'Case Size', value: '49mm Aerospace-grade Titanium' },
          { key: 'Water Resistance', value: '100m water resistant, EN13319 certified' },
          { key: 'Brightness', value: 'Up to 3,000 nits' },
        ],
      },
    },
  });

  // Product 4: Nike Air Max 270
  const prodNike = await prisma.product.create({
    data: {
      name: "Nike Air Max 270 React Running Shoes",
      slug: 'nike-air-max-270-react-sneakers',
      sku: 'NKE-AM270-RED-BLK',
      description: "Nike's first lifestyle Air Max brings you style, comfort and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, showcasing Nike's greatest innovation with its large window and fresh array of colors.",
      shortDescription: 'Max Air 270 unit delivers unrivaled, all-day comfort. Woven and synthetic fabric on the upper provides a lightweight fit.',
      price: 13995,
      compareAtPrice: 15995,
      costPrice: 9000,
      stock: 60,
      lowStockThreshold: 10,
      brandId: brandNike.id,
      categoryId: catFashion.id,
      rating: 4.7,
      reviewCount: 215,
      isPublished: true,
      isFeatured: true,
      isTrending: true,
      weight: 0.85,
      dimensions: '35 x 24 x 13 cm',
      warranty: '6 Months Brand Warranty against manufacturing defects',
      manufacturer: 'Nike Inc., Beaverton, Oregon',
      tags: 'shoes,sneakers,nike,airmax,fashion,running,lifestyle',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
            alt: 'Nike Air Max Red and Black Edition',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'UK 8 / Crimson Red',
            sku: 'NKE-AM270-UK8-RED',
            price: 13995,
            stock: 20,
            size: 'UK 8',
            color: 'Crimson Red',
          },
          {
            name: 'UK 9 / Crimson Red',
            sku: 'NKE-AM270-UK9-RED',
            price: 13995,
            stock: 25,
            size: 'UK 9',
            color: 'Crimson Red',
          },
          {
            name: 'UK 10 / Crimson Red',
            sku: 'NKE-AM270-UK10-RED',
            price: 13995,
            stock: 15,
            size: 'UK 10',
            color: 'Crimson Red',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'Sole Material', value: 'Rubber Outsole with Flex Grooves' },
          { key: 'Cushioning', value: 'Air Max 270 unit' },
          { key: 'Closure', value: 'Lace-Up' },
        ],
      },
    },
  });

  // Product 5: Bose QuietComfort Ultra
  const prodBose = await prisma.product.create({
    data: {
      name: 'Bose QuietComfort Ultra Earbuds with Spatial Audio',
      slug: 'bose-quietcomfort-ultra-earbuds',
      sku: 'BSE-QCU-EAR-WHT',
      description: 'Groundbreaking spatialized audio for more immersive listening that makes your music feel realer than ever before. World-class active noise cancellation and CustomTune technology that auto-adjusts sound performance to your ears.',
      shortDescription: 'Spatial audio earbuds with world-class noise cancellation and up to 24 hours total battery life with case.',
      price: 25900,
      compareAtPrice: 29900,
      costPrice: 19500,
      stock: 35,
      lowStockThreshold: 5,
      brandId: brandBose.id,
      categoryId: catAudio.id,
      rating: 4.8,
      reviewCount: 78,
      isPublished: true,
      isFeatured: false,
      isTrending: true,
      weight: 0.08,
      dimensions: '3.1 x 2.0 x 2.4 cm',
      warranty: '1 Year Bose Manufacturer Warranty',
      manufacturer: 'Bose Corporation, Framingham, Massachusetts',
      tags: 'bose,earbuds,tws,anc,spatial-audio,music',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
            alt: 'Bose QuietComfort Ultra Earbuds',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'White Smoke',
            sku: 'BSE-QCU-WHT',
            price: 25900,
            stock: 20,
            color: 'White Smoke',
          },
          {
            name: 'Black',
            sku: 'BSE-QCU-BLK',
            price: 25900,
            stock: 15,
            color: 'Black',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'Microphone', value: 'Built-in 4-mic array in each earbud' },
          { key: 'Bluetooth Range', value: 'Up to 9 meters (30 feet)' },
          { key: 'Water Rating', value: 'IPX4 sweat and water resistant' },
        ],
      },
    },
  });

  // Product 6: Dyson Purifier Hot+Cool HP09
  const prodDyson = await prisma.product.create({
    data: {
      name: 'Dyson Purifier Hot+Cool Formaldehyde HP09 Air Purifier',
      slug: 'dyson-purifier-hot-cool-hp09',
      sku: 'DYS-HP09-PUR-NKL',
      description: 'Destroys formaldehyde permanently. Automatically detects and traps pollutants with full HEPA H13 standard sealed filtration. Heats in winter and cools you in summer with Air Multiplier technology oscillating up to 350 degrees.',
      shortDescription: '3-in-1 HEPA Air Purifier, Fan and Heater with solid-state Formaldehyde sensor.',
      price: 58900,
      compareAtPrice: 66900,
      costPrice: 45000,
      stock: 15,
      lowStockThreshold: 4,
      brandId: brandDyson.id,
      categoryId: catHome.id,
      rating: 4.9,
      reviewCount: 62,
      isPublished: true,
      isFeatured: true,
      weight: 5.7,
      dimensions: '76.4 x 22 x 22 cm',
      warranty: '2 Years Dyson Comprehensive On-Site Warranty',
      manufacturer: 'Dyson Technology Limited, Malmesbury, UK',
      tags: 'dyson,air-purifier,heater,smart-home,appliances',
      images: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=1000&q=80',
            alt: 'Dyson Purifier Hot+Cool HP09 Nickel Gold',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
      },
      variants: {
        create: [
          {
            name: 'White / Gold',
            sku: 'DYS-HP09-WHT-GLD',
            price: 58900,
            stock: 15,
            color: 'White/Gold',
          },
        ],
      },
      attributes: {
        create: [
          { key: 'Filtration Standard', value: 'HEPA H13 sealed system (99.95% particles)' },
          { key: 'Oscillation', value: '45° to 350° rotation' },
          { key: 'Smart App', value: 'MyDyson app & Voice Assistant control' },
        ],
      },
    },
  });

  // 6. Inventories linked to Warehouses
  console.log('📦 Linking Inventory to Warehouses...');
  await prisma.inventory.create({
    data: {
      productId: prodSony.id,
      warehouseId: whMum.id,
      totalStock: 30,
      availableStock: 28,
      reservedStock: 2,
      soldStock: 15,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: prodSony.id,
      warehouseId: whBlr.id,
      totalStock: 15,
      availableStock: 15,
      reservedStock: 0,
      soldStock: 8,
    },
  });

  await prisma.inventory.create({
    data: {
      productId: prodApple.id,
      warehouseId: whMum.id,
      totalStock: 18,
      availableStock: 16,
      reservedStock: 2,
      soldStock: 30,
    },
  });

  // 7. Banners
  console.log('🎨 Creating Promotional Banners...');
  await prisma.banner.createMany({
    data: [
      {
        title: 'Next-Gen Acoustic Mastery',
        subtitle: 'Experience pure sonic silence with the Sony WH-1000XM5. Up to ₹5,000 instant cashback.',
        link: `/products/${prodSony.slug}`,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Shop Headphones',
        position: 'HERO',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Titanium. Groundbreaking. Pro.',
        subtitle: 'Explore the iPhone 15 Pro series. Free express shipping with 2-day delivery.',
        link: `/products/${prodApple.slug}`,
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Discover Flagships',
        position: 'HERO',
        isActive: true,
        sortOrder: 2,
      },
      {
        title: 'Precision Athletics & Streetwear',
        subtitle: 'Nike Air Max 270 collection with extra 10% off using coupon code WELCOME10.',
        link: `/products/${prodNike.slug}`,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
        buttonText: 'Explore Collection',
        position: 'PROMO_MIDDLE',
        isActive: true,
        sortOrder: 3,
      },
    ],
  });

  // 8. Coupons
  console.log('🎟️ Creating Coupons...');
  const couponWelcome = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      description: 'Get 10% off on your first order up to ₹1,000 on minimum spend of ₹1,999.',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 1999,
      maxDiscountAmount: 1000,
      usageLimit: 500,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'FLAT500',
      description: 'Flat ₹500 instant discount on orders above ₹2,999.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 500,
      minOrderAmount: 2999,
      maxDiscountAmount: 500,
      usageLimit: 200,
      perUserLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SUPERDEAL',
      description: 'Exclusive 15% discount for premium luxury purchases above ₹20,000.',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderAmount: 20000,
      maxDiscountAmount: 5000,
      usageLimit: 100,
      perUserLimit: 2,
      isActive: true,
    },
  });

  // 9. Site Settings
  console.log('⚙️ Creating Store Settings...');
  await prisma.siteSetting.createMany({
    data: [
      { key: 'STORE_NAME', value: 'NEXUS LUXE COMMERCE', description: 'Public facing store title' },
      { key: 'SUPPORT_EMAIL', value: 'concierge@nexuscommerce.com', description: 'Customer support contact email' },
      { key: 'SUPPORT_PHONE', value: '+91 (080) 4567-8900', description: 'Toll-free customer helpline' },
      { key: 'FREE_SHIPPING_THRESHOLD', value: '999', description: 'Minimum cart total in INR for free standard shipping' },
      { key: 'STANDARD_SHIPPING_FEE', value: '99', description: 'Default shipping fee for below threshold orders' },
      { key: 'TAX_RATE_PERCENT', value: '18', description: 'Default GST percentage included or applied' },
      { key: 'RETURN_WINDOW_DAYS', value: '7', description: 'Allowed days after delivery for returns/refunds' },
      { key: 'GSTIN', value: '29AABCU9603R1ZM', description: 'Registered Goods & Services Tax Identification Number' },
    ],
  });

  // 10. Sample Customer Order
  console.log('📋 Creating Sample Completed & In-Transit Orders...');
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-89412',
      userId: customer.id,
      status: 'PROCESSING',
      paymentStatus: 'PAID',
      paymentMethod: 'RAZORPAY',
      paymentId: 'pay_Nz9a1Kd8fLp0Qz',
      currency: 'INR',
      subtotal: 29990,
      taxAmount: 5398.2,
      shippingFee: 0,
      discountAmount: 1000,
      totalAmount: 28990,
      shippingAddressSnapshot: JSON.stringify(customerAddress),
      courierName: 'Delhivery Express',
      trackingNumber: 'DEL-IND-99482104',
      trackingUrl: 'https://www.delhivery.com/track/package/DEL-IND-99482104',
      notes: 'Customer opted for gift packaging',
      items: {
        create: [
          {
            productId: prodSony.id,
            productName: prodSony.name,
            productSku: prodSony.sku,
            productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
            variantName: 'Black',
            quantity: 1,
            unitPrice: 29990,
            totalPrice: 29990,
          },
        ],
      },
      payments: {
        create: [
          {
            transactionId: 'txn_rzp_9841289412',
            gateway: 'RAZORPAY',
            amount: 28990,
            currency: 'INR',
            status: 'SUCCESS',
            paymentMethod: 'UPI',
            signature: 'sig_verified_sample_razorpay',
          },
        ],
      },
    },
  });

  // Record coupon usage
  await prisma.couponUsage.create({
    data: {
      couponId: couponWelcome.id,
      userId: customer.id,
      orderId: order1.id,
      discountAmount: 1000,
    },
  });

  // 11. Sample Reviews
  console.log('⭐ Creating Verified Customer Reviews...');
  await prisma.review.create({
    data: {
      productId: prodSony.id,
      userId: customer.id,
      rating: 5,
      title: 'Flawless noise cancellation for work and flights!',
      comment: 'Upgraded from the XM3 and the difference in microphone clarity and comfort is astonishing. Battery life easily lasts a whole week of work meetings and travel.',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulVotes: 24,
      unhelpfulVotes: 1,
    },
  });

  await prisma.review.create({
    data: {
      productId: prodApple.id,
      userId: customer.id,
      rating: 5,
      title: 'The titanium finish feels incredible in the hand',
      comment: 'Super lightweight compared to the 14 Pro Max. The 5x camera lens captures stunning details. Battery easily lasts 1.5 days on heavy use.',
      isVerifiedPurchase: true,
      isApproved: true,
      helpfulVotes: 38,
      unhelpfulVotes: 0,
    },
  });

  // 12. Support Ticket
  console.log('🎫 Creating Sample Support Ticket...');
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: 'TCK-2026-1042',
      userId: customer.id,
      subject: 'Inquiry regarding shipment delivery time slot',
      category: 'ORDER',
      priority: 'MEDIUM',
      status: 'OPEN',
      messages: {
        create: [
          {
            senderId: customer.id,
            senderRole: 'CUSTOMER',
            message: 'Hello, I have placed order ORD-2026-89412. Could you please confirm if delivery can be scheduled between 4 PM and 7 PM?',
          },
        ],
      },
    },
  });

  // 13. Newsletter Subscriber
  await prisma.newsletterSubscriber.create({
    data: {
      email: 'subscriber.vip@example.com',
      isActive: true,
    },
  });

  // 14. Stores
  console.log('🏪 Creating Sample Stores...');
  const mainStore = await prisma.store.create({
    data: {
      name: 'Rexpresso Official Store',
      slug: 'rexpresso-official',
      description: 'The official Rexpresso premium electronics and lifestyle store.',
      contactEmail: 'store@rexpresso.com',
      contactPhone: '+91 (080) 4567-8900',
      address: 'Plot 42, MIDC Industrial Area',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400093',
      isActive: true,
      ownerId: superAdmin.id,
    },
  });

  const techStore = await prisma.store.create({
    data: {
      name: 'TechZone Premium',
      slug: 'techzone-premium',
      description: 'Latest gadgets and cutting-edge tech accessories.',
      contactEmail: 'tech@rexpresso.com',
      contactPhone: '+91 (080) 3333-4444',
      address: 'Hosur Road, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560100',
      isActive: true,
      ownerId: admin.id,
    },
  });

  // 15. Offers
  console.log('🏷️ Creating Sample Offers...');
  await prisma.offer.create({
    data: {
      title: 'Welcome 15% Off',
      description: 'Get 15% off on your first purchase.',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      minOrderAmount: 999,
      maxDiscountAmount: 2000,
      isActive: true,
      applicableTo: 'ALL',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  await prisma.offer.create({
    data: {
      title: 'Electronics Bonanza',
      description: 'Flat ₹500 off on electronics above ₹5000.',
      discountType: 'FIXED_AMOUNT',
      discountValue: 500,
      minOrderAmount: 5000,
      isActive: true,
      applicableTo: 'STORE',
      storeId: mainStore.id,
      startDate: new Date('2026-11-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  console.log('✅ Database seeding finished successfully with realistic e-commerce data!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
