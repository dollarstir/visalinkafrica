import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CtaSection = ({ block_props = {} }) => {
  const { title, subtitle, button_text, button_link } = block_props;
  return (
    <section className="section-padding bg-primary-600 dark:bg-primary-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_20%_80%,rgba(255,255,255,0.12)_0%,transparent_50%)]" />
      <div className="container-narrow relative text-center">
        {title && (
          <h2 className="section-heading text-2xl md:text-3xl lg:text-4xl text-white mb-4">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="section-subheading text-primary-100 dark:text-primary-200 mb-8 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
        {button_text && button_link && (
          <Link
            to={button_link}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-primary-600 bg-white rounded-lg hover:bg-slate-50 shadow-corporate hover:shadow-corporate-lg transition-all duration-200"
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
