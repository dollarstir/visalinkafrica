import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageSlider from './ImageSlider';
import SectionRenderer from './sections/SectionRenderer';
import apiService from '../../services/api';

const HomePage = () => {
  const [sections, setSections] = useState([]);
  const [homePage, setHomePage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiService.getPageSections('home'),
      apiService.getWebsitePage('home')
    ])
      .then(([sectionsData, pageData]) => {
        if (!cancelled) {
          setSections(sectionsData.sections || []);
          setHomePage(pageData.page || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSections([]);
          setHomePage(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // If no sections from API, show a minimal default (hero first, agent CTA last)
  const displaySections = sections.length > 0
    ? sections
    : [
        { id: 0, block_type: 'hero', block_props: { title: 'Our Services', subtitle: 'Visa applications, passport services, and document assistance across Africa.', cta_text: 'Get Started', cta_link: '/services' } },
        { id: 1, block_type: 'agent_cta', block_props: { title: 'Become an Agent', subtitle: 'Join our network and grow your business.', button_text: 'Apply Now', button_link: '/register-agent' } }
      ];

  const hasHomeBody = homePage && homePage.body && homePage.body.trim().replace(/<[^>]+>/g, '').trim().length > 0;

  return (
    <>
      <ImageSlider pageSlug="home" />
      {loading ? (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : (
        <>
          {displaySections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
          {/* Content from Admin → Website → Pages → Home (so homepage shows what you edit there) */}
          {hasHomeBody && (
            <section className="section-padding bg-slate-50 dark:bg-gray-800/50">
              <div className="container-narrow">
                <div
                  className="prose prose-slate prose-lg dark:prose-invert max-w-none prose-headings:tracking-tight prose-p:leading-relaxed text-slate-600 dark:text-gray-400"
                  dangerouslySetInnerHTML={{ __html: homePage.body }}
                />
              </div>
            </section>
          )}
        </>
      )}
      <section className="py-8 bg-slate-100 dark:bg-gray-800/60 border-t border-slate-200 dark:border-gray-700">
        <div className="container-wide flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 text-center">
          <span className="text-sm text-slate-500 dark:text-gray-500">Staff & agents</span>
          <Link
            to="/login"
            className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors underline underline-offset-2"
          >
            Login to CRM
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
