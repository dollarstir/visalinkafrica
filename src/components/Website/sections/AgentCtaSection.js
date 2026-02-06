import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';

const AgentCtaSection = ({ block_props = {} }) => {
  const { title, subtitle, button_text, button_link } = block_props;
  return (
    <section className="section-padding bg-slate-900 dark:bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_70%_20%,rgba(0,107,199,0.18)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent dark:from-black" />
      <div className="container-narrow relative text-center">
        {title && (
          <h2 className="section-heading text-2xl md:text-3xl lg:text-4xl text-white mb-4 flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-500/20 text-primary-400">
              <UserPlus className="h-6 w-6" />
            </span>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="section-subheading text-slate-300 dark:text-slate-400 mb-10 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
        {button_text && (
          <Link
            to={button_link || '/register-agent'}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold rounded-lg bg-primary-500 hover:bg-primary-600"
          >
            {button_text}
            <ArrowRight className="h-5 w-5" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default AgentCtaSection;
