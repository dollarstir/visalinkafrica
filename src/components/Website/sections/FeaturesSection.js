import React from 'react';
import { Zap, Shield, DollarSign } from 'lucide-react';

const defaultIcons = [Zap, Shield, DollarSign];

const FeaturesSection = ({ block_props = {} }) => {
  const { title, items = [] } = block_props;
  if (!items.length) return null;
  return (
    <section className="section-padding bg-white dark:bg-gray-900">
      <div className="container-wide">
        {title && (
          <h2 className="section-heading text-center mb-3">
            {title}
          </h2>
        )}
        <p className="section-subheading text-center mb-12 md:mb-14">Trusted solutions for your visa and document needs.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {items.map((item, i) => {
            const Icon = defaultIcons[i % defaultIcons.length];
            return (
              <div
                key={i}
                className="group relative p-6 md:p-8 rounded-xl bg-slate-50/80 dark:bg-gray-800/80 border border-slate-200/80 dark:border-gray-700/80 hover:shadow-corporate-lg hover:border-primary-200/80 dark:hover:border-primary-800/40 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                {item.title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm md:text-base">{item.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
