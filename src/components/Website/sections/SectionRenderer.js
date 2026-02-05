import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import TextSection from './TextSection';
import CtaSection from './CtaSection';
import AgentCtaSection from './AgentCtaSection';

const COMPONENTS = {
  hero: HeroSection,
  features: FeaturesSection,
  text: TextSection,
  cta: CtaSection,
  agent_cta: AgentCtaSection
};

const SectionRenderer = ({ section }) => {
  if (!section || !section.block_type) return null;
  const Component = COMPONENTS[section.block_type];
  if (!Component) return null;
  return <Component block_props={section.block_props || {}} />;
};

export default SectionRenderer;
