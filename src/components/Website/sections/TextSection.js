import React from 'react';

const TextSection = ({ block_props = {} }) => {
  const { title, content } = block_props;
  if (!title && !content) return null;
  return (
    <section className="py-20 md:py-24 bg-slate-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        {title && (
          <h2 className="section-heading mb-6">
            {title}
          </h2>
        )}
        {content && (
          <div
            className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 prose-headings:tracking-tight prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
};

export default TextSection;
