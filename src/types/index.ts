export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PRODUCT_MANAGER'
  | 'ORDER_MANAGER'
  | 'INVENTORY_MANAGER'
  | 'MARKETING_MANAGER'
  | 'SUPPORT_AGENT'
  | 'ACCOUNTANT'
  | 'CUSTOMER'
  | 'SELLER';

export interface UserSessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'PARTIALLY_REFUNDED';

export type PaymentMethod =
  | 'RAZORPAY'
  | 'CASHFREE'
  | 'CARD'
  | 'UPI'
  | 'NET_BANKING'
  | 'COD';

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isFlashSale: boolean;
  flashSaleEndDate?: string | Date | null;
  images: {
    id: string;
    url: string;
    alt?: string | null;
    isPrimary: boolean;
  }[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  variants?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    size?: string | null;
    color?: string | null;
    storage?: string | null;
  }[];
}

export interface CartItemModel {
  id: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    compareAtPrice?: number | null;
    stock: number;
    images: { url: string; alt?: string | null }[];
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    color?: string | null;
    size?: string | null;
    storage?: string | null;
  } | null;
}

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  deliveryNotes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
