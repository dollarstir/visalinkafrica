import React from 'react';
import { Link } from 'react-router-dom';
import ImageSlider from './ImageSlider';
import WebsitePage from './WebsitePage';

const HomePage = () => {
  return (
    <>
      <ImageSlider pageSlug="home" />
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-900 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            VisaLink Africa
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your trusted partner for visa and document services across Africa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register-agent"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
            >
              Register to become an agent
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors"
            >
              Login to CRM
            </Link>
          </div>
        </div>
      </section>
      <WebsitePage slug="home" />
    </>
  );
};

export default HomePage;
