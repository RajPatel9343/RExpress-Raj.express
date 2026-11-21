'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistCount: number;
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistIds: [],
  wishlistCount: 0,
  loading: false,
  isInWishlist: () => false,
  toggleWishlist: async () => false,
  refreshWishlist: async () => {},
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlistIds([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setWishlistIds(json.data.map((p: any) => p.id));
        }
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlistIds.includes(productId);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.action === 'added') {
          setWishlistIds((prev) => [...prev, productId]);
        } else {
          setWishlistIds((prev) => prev.filter((id) => id !== productId));
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount: wishlistIds.length,
        loading,
        isInWishlist,
        toggleWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
