import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import apiService from '../../services/api';

const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try {
    const base = new URL(apiService.baseURL).origin;
    return base + url;
  } catch {
    return window.location.origin + url;
  }
};

const ImageSlider = ({ pageSlug = 'home', intervalMs = 6000, className = '' }) => {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getWebsiteSlides(pageSlug).then((data) => {
      setSlides(data.slides || []);
      setIndex(0);
    }).catch(() => setSlides([])).finally(() => setLoading(false));
  }, [pageSlug]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [slides.length, intervalMs]);

  if (loading || slides.length === 0) return null;

  const slide = slides[index];
  const imgUrl = getImageUrl(slide.image_url);

  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      <div className="relative aspect-[21/9] min-h-[280px] max-h-[500px] bg-gray-900">
        <img
          src={imgUrl}
          alt={slide.title || 'Slide'}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            {slide.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2">
                {slide.title}
              </h2>
            )}
            {slide.subtitle && (
              <p className="text-lg md:text-xl text-white/95 drop-shadow">
                {slide.subtitle}
              </p>
            )}
            {slide.link_url && (
              <Link
                to={slide.link_url.startsWith('/') ? slide.link_url : '#'}
                href={slide.link_url.startsWith('http') ? slide.link_url : undefined}
                className="inline-block mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Learn more
              </Link>
            )}
          </div>
        </div>
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % slides.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default ImageSlider;
