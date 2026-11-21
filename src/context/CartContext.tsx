'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
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

interface CartContextType {
  cartId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
  loading: boolean;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<{ success: boolean; error?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeCoupon: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({
  cartId: null,
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  couponCode: null,
  total: 0,
  loading: false,
  addToCart: async () => ({ success: false }),
  updateQuantity: async () => false,
  removeItem: async () => false,
  applyCoupon: async () => ({ success: false }),
  removeCoupon: async () => {},
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cart');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCartId(json.data.id);
          setItems(json.data.items || []);
          setDiscount(json.data.discount || 0);
          setCouponCode(json.data.couponCode || null);
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const subtotal = items.reduce((acc, item) => {
    const p = item.variant?.price ?? item.price;
    return acc + p * item.quantity;
  }, 0);

  const total = Math.max(0, subtotal - discount);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = async (productId: string, variantId?: string | null, quantity: number = 1) => {
    try {
      setLoading(true);
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Could not add to cart' };
      }
      await refreshCart();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) {
        return await removeItem(itemId);
      }
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          cartSubtotal: subtotal,
          cartId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid coupon' };
      }

      setDiscount(data.data.discountAmount);
      setCouponCode(data.data.code);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: 'Network error validating coupon' };
    }
  };

  const removeCoupon = async () => {
    setDiscount(0);
    setCouponCode(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartId,
        items,
        itemCount,
        subtotal,
        discount,
        couponCode,
        total,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
