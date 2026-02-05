import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CtaSection = ({ block_props = {} }) => {
  const { title, subtitle, button_text, button_link } = block_props;
  return (
    <section className="py-20 md:py-24 bg-primary-600 dark:bg-primary-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.15)_0%,transparent_50%)]" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xl text-primary-100 mb-8 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
        {button_text && button_link && (
          <Link
            to={button_link}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-primary-600 bg-white rounded-xl hover:bg-gray-50 shadow-soft transition-all duration-200"
          >
            {button_text}
            <ArrowRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default CtaSection;
