import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = ({ block_props = {} }) => {
  const { title, subtitle, cta_text, cta_link } = block_props;
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/40 to-transparent dark:from-primary-900/20" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl text-center">
        {title && (
          <h1 className="section-heading text-4xl md:text-5xl lg:text-display-lg mb-5">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="section-subheading mb-10">
            {subtitle}
          </p>
        )}
        {cta_text && cta_link && (
          <Link
            to={cta_link}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-soft hover:shadow-card transition-all duration-200"
          >
            {cta_text}
            <ArrowRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
