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
    <section className={`relative w-full max-w-[100vw] overflow-hidden ${className}`}>
      {/* Mobile: 4:3 so image fits and keeps context; tablet: 16:9; desktop: 21:9 */}
      <div className="relative w-full aspect-[4/3] sm:aspect-video md:aspect-[21/9] min-h-[200px] sm:min-h-[260px] max-h-[70vh] sm:max-h-[400px] md:max-h-[500px] bg-gray-900">
          <img
            src={imgUrl}
            alt={slide.title || 'Slide'}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-end justify-center text-center px-4 pb-10 sm:pb-12 md:pb-16 lg:pb-20">
            <div className="max-w-3xl w-full">
              {slide.title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-lg mb-2 sm:mb-3">
                  {slide.title}
                </h2>
              )}
              {slide.subtitle && (
                <p className="text-base sm:text-lg md:text-xl text-white/95 drop-shadow mb-4 sm:mb-6 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
              )}
              {slide.link_url && (
                <Link
                  to={slide.link_url.startsWith('/') ? slide.link_url : '#'}
                  href={slide.link_url.startsWith('http') ? slide.link_url : undefined}
                  className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 bg-white text-gray-900 font-semibold rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 text-sm sm:text-base"
                >
                  Learn more
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              )}
            </div>
          </div>
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center p-3 rounded-full bg-black/50 sm:bg-white/20 backdrop-blur-sm text-white hover:bg-black/60 sm:hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-7 w-7 sm:h-6 sm:w-6 shrink-0" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((i) => (i + 1) % slides.length)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center p-3 rounded-full bg-black/50 sm:bg-white/20 backdrop-blur-sm text-white hover:bg-black/60 sm:hover:bg-white/30 transition-all duration-200 border border-white/30 shadow-lg"
                aria-label="Next slide"
              >
                <ChevronRight className="h-7 w-7 sm:h-6 sm:w-6 shrink-0" />
              </button>
              <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all duration-200 ${i === index ? 'w-6 sm:w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'}`}
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
