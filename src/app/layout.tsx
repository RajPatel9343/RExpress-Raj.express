import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Rexpresso - Premium E-Commerce',
  description: 'Rexpresso - Premium E-Commerce',
  keywords: 'ecommerce, luxury electronics, headphones, smartphones, india, razorpay',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-theme-gray-bg text-theme-black antialiased selection:bg-theme-blue selection:text-white">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AnnouncementBar />
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
