import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, ArrowRight } from 'lucide-react';

const AgentCtaSection = ({ block_props = {} }) => {
  const { title, subtitle, button_text, button_link } = block_props;
  return (
    <section className="py-20 md:py-24 bg-slate-900 dark:bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.15)_0%,transparent_50%)]" />
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl text-center">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 flex items-center justify-center gap-3">
            <UserPlus className="h-10 w-10 text-primary-400" />
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-xl text-slate-300 mb-8 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
        {button_text && (
          <Link
            to={button_link || '/register-agent'}
            className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-soft hover:shadow-glow transition-all duration-200"
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
