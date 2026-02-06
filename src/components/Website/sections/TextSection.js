import React from 'react';

const TextSection = ({ block_props = {} }) => {
  const { title, content } = block_props;
  if (!title && !content) return null;
  return (
    <section className="section-padding bg-slate-50 dark:bg-gray-800/50">
      <div className="container-narrow">
        {title && (
          <h2 className="section-heading mb-6">
            {title}
          </h2>
        )}
        {content && (
          <div
            className="prose prose-slate prose-lg dark:prose-invert max-w-none text-slate-600 dark:text-gray-400 prose-headings:tracking-tight prose-p:leading-relaxed prose-headings:text-gray-900 dark:prose-headings:text-white"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
};

export default TextSection;
