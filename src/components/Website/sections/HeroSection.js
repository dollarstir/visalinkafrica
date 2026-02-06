import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = ({ block_props = {} }) => {
  const { title, subtitle, cta_text, cta_link } = block_props;
  return (
    <section className="relative section-padding overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-primary-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-primary-900/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,107,199,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
      <div className="container-narrow relative text-center">
        {title && (
          <h1 className="section-heading text-3xl sm:text-4xl md:text-5xl lg:text-display-lg mb-6 text-gray-900 dark:text-white">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="section-subheading mb-10 text-slate-600 dark:text-gray-400">
            {subtitle}
          </p>
        )}
        {cta_text && cta_link && (
          <Link
            to={cta_link}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold rounded-lg"
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
