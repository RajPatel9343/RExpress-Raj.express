'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Share2,
  MapPin,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from './ProductCard';

interface ProductDetailViewProps {
  product: any;
  relatedProducts: any[];
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  // Selected image
  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.url || 'https://via.placeholder.com/600'
  );

  // Selected variant
  const [selectedVariant, setSelectedVariant] = useState<any>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );

  // Quantity
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // Pincode checker state
  const [pincode, setPincode] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<any>(null);

  // Write Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const currentPrice = selectedVariant?.price ?? product.price;
  const currentStock = selectedVariant?.stock ?? product.stock;
  const isOutOfStock = currentStock <= 0;
  const inWishlist = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercentage(currentPrice, product.compareAtPrice);

  const handleAddToCart = async () => {
    if (isOutOfStock || addingToCart) return;
    setAddingToCart(true);
    const res = await addToCart(product.id, selectedVariant?.id, quantity);
    setAddingToCart(false);

    if (res.success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product.id, selectedVariant?.id, quantity);
    router.push('/checkout');
  };

  const handleCheckPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) return;
    setPincodeChecking(true);
    setPincodeResult(null);

    try {
      const res = await fetch(`/api/shipping/serviceability?pincode=${pincode}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPincodeResult(data.data);
      }
    } catch (err) {
    } finally {
      setPincodeChecking(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    setSubmittingReview(true);
    setReviewError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setReviewModalOpen(false);
          setReviewSuccess(false);
          router.refresh();
        }, 1500);
      } else {
        setReviewError(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setReviewError('Network error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs text-theme-gray-medium">
        <Link href="/" className="hover:text-theme-blue">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-theme-blue">
          Catalog
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-theme-blue capitalize"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-theme-black font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase (Gallery + Details) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 bg-white p-6 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-theme-gray-bg border border-theme-gray-border">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-theme-blue text-white text-xs font-bold rounded-lg shadow-md">
                {discountPercent}% OFF
              </span>
            )}
            {product.isFlashSale && (
              <span className="absolute top-4 right-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg shadow-md uppercase tracking-wider">
                Flash Deal
              </span>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {product.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === img.url
                      ? 'border-theme-blue ring-2 ring-blue-100'
                      : 'border-theme-gray-border hover:border-gray-400'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Actions & Config */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-theme-gray-medium mb-1.5">
              <span>{product.brand?.name || 'Exclusive Partner'}</span>
              <span>SKU: {selectedVariant?.sku || product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-black leading-tight">
              {product.name}
            </h1>

            {/* Ratings and review badge */}
            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1.5 text-xs font-bold text-theme-black">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-theme-gray-medium">•</span>
              <span className="text-xs text-theme-blue font-semibold hover:underline cursor-pointer">
                {product.reviewCount} Verified Customer Reviews
              </span>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="p-4 bg-theme-gray-bg rounded-2xl border border-theme-gray-border flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-theme-black">
                  {formatPrice(currentPrice)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > currentPrice && (
                  <span className="text-base text-theme-gray-medium line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-theme-gray-medium mt-1">
                Inclusive of all applicable Indian taxes & GST. Free express courier delivery.
              </p>
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  isOutOfStock
                    ? 'bg-red-100 text-red-700'
                    : currentStock <= 5
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : currentStock <= 5
                  ? `Only ${currentStock} Left`
                  : 'In Stock & Ready to Ship'}
              </span>
            </div>
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-xs text-theme-gray-dark leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-theme-black uppercase tracking-wider block">
                Select Edition / Variant
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedVariant?.id === v.id
                        ? 'bg-theme-blue text-white border-theme-blue shadow-sm'
                        : 'bg-white text-theme-black border-theme-gray-border hover:border-theme-blue'
                    }`}
                  >
                    {v.name} - {formatPrice(v.price)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-theme-black uppercase tracking-wider">
                Quantity:
              </span>
              <div className="flex items-center border border-theme-gray-border rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm text-theme-gray-dark hover:bg-theme-gray-bg"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-theme-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-3 py-1.5 text-sm text-theme-gray-dark hover:bg-theme-gray-bg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all ${
                  addedToCart
                    ? 'bg-green-600 text-white'
                    : isOutOfStock
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-theme-blue text-white hover:bg-theme-blue-dark shadow-md hover:shadow-blue-500/20'
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{addingToCart ? 'Adding...' : 'Add to Shopping Cart'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 rounded-xl font-bold text-xs bg-theme-black text-white hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center space-x-2 disabled:bg-gray-300"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Buy Now with 1-Click</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-center transition-colors ${
                  inWishlist
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'bg-white text-theme-gray-dark border-theme-gray-border hover:border-red-300 hover:text-red-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current text-red-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="pt-4 border-t border-theme-gray-border space-y-2">
            <span className="text-xs font-bold text-theme-black flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-theme-blue" />
              <span>Check Courier Delivery & COD Availability</span>
            </span>

            <form onSubmit={handleCheckPincode} className="flex gap-2 max-w-sm">
              <input
                type="text"
                placeholder="Enter 6-digit PIN Code"
                value={pincode}
                maxLength={6}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
              />
              <button
                type="submit"
                disabled={pincodeChecking || pincode.length !== 6}
                className="px-4 py-2 bg-theme-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 disabled:bg-gray-300 transition-colors"
              >
                {pincodeChecking ? 'Checking...' : 'Check'}
              </button>
            </form>

            {pincodeResult && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 mt-2 space-y-1">
                <div className="font-bold flex items-center space-x-1 text-green-700">
                  <Check className="w-3.5 h-3.5" />
                  <span>Serviceable: Delivery to {pincodeResult.city}, {pincodeResult.state}</span>
                </div>
                <div className="text-[11px] text-gray-700">
                  Estimated Dispatch: Within 24 hours | Expected Arrival in {pincodeResult.estimatedDays} business days.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specifications & Product Description */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-8">
        <div>
          <h2 className="text-lg font-bold text-theme-black mb-3 pb-2 border-b border-theme-gray-border">
            Product Overview & Engineering
          </h2>
          <p className="text-xs sm:text-sm text-theme-gray-dark leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Technical Attributes Table */}
        {product.attributes && product.attributes.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-theme-black mb-4">
              Technical Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {product.attributes.map((attr: any) => (
                <div
                  key={attr.id}
                  className="flex items-center justify-between p-3 bg-theme-gray-bg rounded-xl border border-theme-gray-border"
                >
                  <span className="font-semibold text-theme-gray-medium">{attr.key}</span>
                  <span className="font-bold text-theme-black text-right">{attr.value}</span>
                </div>
              ))}
              {product.warranty && (
                <div className="flex items-center justify-between p-3 bg-theme-gray-bg rounded-xl border border-theme-gray-border">
                  <span className="font-semibold text-theme-gray-medium">Warranty</span>
                  <span className="font-bold text-theme-black">{product.warranty}</span>
                </div>
              )}
              {product.manufacturer && (
                <div className="flex items-center justify-between p-3 bg-theme-gray-bg rounded-xl border border-theme-gray-border">
                  <span className="font-semibold text-theme-gray-medium">Manufacturer</span>
                  <span className="font-bold text-theme-black">{product.manufacturer}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Verified Customer Reviews Section */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-theme-gray-border shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-theme-gray-border gap-4">
          <div>
            <h2 className="text-lg font-bold text-theme-black">
              Verified Buyer Reviews & Feedback
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold ml-1 text-theme-black">
                  {product.rating.toFixed(1)} out of 5
                </span>
              </div>
              <span className="text-xs text-theme-gray-medium">
                ({product.reviews?.length || product.reviewCount} customer ratings)
              </span>
            </div>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm inline-flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write a Verified Review</span>
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {!product.reviews || product.reviews.length === 0 ? (
            <p className="text-xs text-theme-gray-medium py-6 text-center">
              No written reviews yet. Be the first verified owner to share your experience!
            </p>
          ) : (
            product.reviews.map((rev: any) => (
              <div
                key={rev.id}
                className="p-5 bg-theme-gray-bg rounded-2xl border border-theme-gray-border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-theme-blue text-white flex items-center justify-center font-bold text-xs">
                      {rev.user?.name ? rev.user.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-theme-black">{rev.user?.name || 'Verified Buyer'}</p>
                      {rev.isVerifiedPurchase && (
                        <span className="text-[10px] text-green-700 font-semibold flex items-center">
                          <ShieldCheck className="w-3 h-3 mr-0.5" /> Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.title && (
                  <h4 className="text-xs font-bold text-theme-black pt-1">{rev.title}</h4>
                )}
                <p className="text-xs text-theme-gray-dark leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-theme-black">Frequently Bought Together</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-theme-gray-border">
            <div className="flex items-center justify-between pb-3 border-b border-theme-gray-border">
              <h3 className="text-base font-bold text-theme-black">
                Review &quot;{product.name}&quot;
              </h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {reviewSuccess ? (
              <div className="p-6 bg-green-50 border border-green-200 text-green-800 rounded-2xl text-center space-y-2">
                <Check className="w-8 h-8 text-green-600 mx-auto" />
                <p className="text-sm font-bold">Review Published Successfully!</p>
                <p className="text-xs text-green-700">Thank you for supporting fellow buyers.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-200">
                    {reviewError}
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-theme-black block mb-1">
                    Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-amber-500 p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-black block mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Exceptional sound clarity and battery life"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-black block mb-1">
                    Detailed Review
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Share your experience regarding build quality, features, delivery, or daily use..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-theme-gray-border rounded-xl focus:outline-none focus:border-theme-blue"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="px-4 py-2 border border-theme-gray-border text-theme-gray-dark rounded-xl text-xs font-semibold hover:bg-theme-gray-bg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2 bg-theme-blue text-white rounded-xl text-xs font-bold hover:bg-theme-blue-dark transition-colors shadow-sm disabled:bg-gray-300"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
