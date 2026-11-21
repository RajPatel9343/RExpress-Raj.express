'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const slides = [
  {
    badge: 'Flagship Acoustics',
    title: 'Sony WH-1000XM5 Silence Redefined',
    description: 'Experience studio-grade active noise cancellation and master acoustic engineering with 30-hour battery life.',
    link: '/products/sony-wh-1000xm5-wireless-headphones',
    buttonText: 'Shop Flagship Audio',
    bgImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
    colorAccent: 'from-blue-900/90 via-black/80 to-black/60',
  },
  {
    badge: 'Titanium Innovation',
    title: 'Apple iPhone 15 Pro Max',
    description: 'Forged in aerospace titanium with the groundbreaking A17 Pro chip and 5x optical telephoto lens.',
    link: '/products/apple-iphone-15-pro-max-256gb',
    buttonText: 'Order Today',
    bgImage: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1600&q=80',
    colorAccent: 'from-slate-900/90 via-black/80 to-black/60',
  },
  {
    badge: 'Precision Footwear',
    title: 'Nike Air Max 270 Revolution',
    description: 'Engineered for supreme cushioning and all-day lifestyle performance with lightweight dual-density foam.',
    link: '/products/nike-air-max-270-react-sneakers',
    buttonText: 'Explore Collection',
    bgImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    colorAccent: 'from-blue-950/90 via-black/80 to-black/60',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full h-[480px] sm:h-[560px] lg:h-[620px] bg-theme-black overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <img
            src={slide.bgImage}
            alt={slide.title}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-[7000ms]"
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.colorAccent}`} />

          {/* Slide Text Content */}
          <div className="relative max-w-7xl mx-auto h-full px-6 sm:px-8 lg:px-12 flex flex-col justify-center">
            <div className="max-w-2xl space-y-4 text-white">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-600/30 border border-blue-400/40 rounded-full text-blue-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{slide.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                {slide.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                {slide.description}
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={slide.link}
                  className="px-7 py-3.5 bg-theme-blue text-white rounded-xl font-bold text-sm hover:bg-theme-blue-dark transition-all shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2 group"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/products"
                  className="px-7 py-3.5 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-all border border-white/20 backdrop-blur-md"
                >
                  View Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 text-white hover:bg-theme-blue transition-colors backdrop-blur-md"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 text-white hover:bg-theme-blue transition-colors backdrop-blur-md"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 transition-all rounded-full ${
              idx === current ? 'w-8 bg-theme-blue' : 'w-2 bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
