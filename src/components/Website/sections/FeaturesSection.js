import React from 'react';
import { Zap, Shield, DollarSign } from 'lucide-react';

const defaultIcons = [Zap, Shield, DollarSign];

const FeaturesSection = ({ block_props = {} }) => {
  const { title, items = [] } = block_props;
  if (!items.length) return null;
  return (
    <section className="py-20 md:py-24 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {title && (
          <h2 className="section-heading text-center mb-4">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {items.map((item, i) => {
            const Icon = defaultIcons[i % defaultIcons.length];
            return (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-slate-50 dark:bg-gray-800/80 border border-slate-200/80 dark:border-gray-700/80 hover:shadow-card hover:border-primary-200 dark:hover:border-primary-800/50 transition-all duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 mb-5 group-hover:scale-105 transition-transform">
                  <Icon className="h-6 w-6" />
                </div>
                {item.title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {item.title}
                  </h3>
                )}
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
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
