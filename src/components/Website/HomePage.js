import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageSlider from './ImageSlider';
import SectionRenderer from './sections/SectionRenderer';
import apiService from '../../services/api';

const HomePage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getPageSections('home')
      .then((data) => {
        if (!cancelled) setSections(data.sections || []);
      })
      .catch(() => {
        if (!cancelled) setSections([]);
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

  return (
    <>
      <ImageSlider pageSlug="home" />
      {loading ? (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" aria-hidden />
          <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      ) : (
        displaySections.map((section) => (
          <SectionRenderer key={section.id} section={section} />
        ))
      )}
      <section className="py-10 bg-slate-100 dark:bg-gray-800/80 border-t border-slate-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Staff & agents: Login to CRM
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePage;
