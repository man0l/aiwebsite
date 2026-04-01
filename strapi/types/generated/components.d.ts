import type { Schema, Struct } from '@strapi/strapi';

export interface SectionsCalculator extends Struct.ComponentSchema {
  collectionName: 'components_sections_calculators';
  info: {
    displayName: 'Calculator';
  };
  attributes: {
    ctaUrl: Schema.Attribute.String;
    defaultCloseRate: Schema.Attribute.Integer;
    defaultDealValue: Schema.Attribute.Integer;
    eyebrow: Schema.Attribute.String;
    guaranteeText: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.Text;
  };
}

export interface SectionsCaseStudy extends Struct.ComponentSchema {
  collectionName: 'components_sections_case_studies';
  info: {
    description: 'Client case study card';
    displayName: 'Case Study';
    icon: 'briefcase';
  };
  attributes: {
    description: Schema.Attribute.Text;
    industry: Schema.Attribute.String;
    result: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsChartDataPoint extends Struct.ComponentSchema {
  collectionName: 'components_sections_chart_data_points';
  info: {
    displayName: 'Chart Data Point';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface SectionsCtaSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_cta_sections';
  info: {
    displayName: 'CTA Section';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String & Schema.Attribute.Required;
    ctaUrl: Schema.Attribute.String & Schema.Attribute.Required;
    guaranteeText: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.Text;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    description: 'Landing page hero section';
    displayName: 'Hero';
    icon: 'star';
  };
  attributes: {
    bgImage: Schema.Attribute.String;
    complianceBadges: Schema.Attribute.Component<'sections.hero-badge', true>;
    ctaLabel: Schema.Attribute.String;
    ctaUrl: Schema.Attribute.String;
    founderAvatarUrl: Schema.Attribute.String;
    founderCredential: Schema.Attribute.String;
    founderName: Schema.Attribute.String;
    founderQuote: Schema.Attribute.String;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    howItWorksSteps: Schema.Attribute.Component<
      'sections.how-it-works-step',
      true
    >;
    howItWorksTitle: Schema.Attribute.String;
    pipelineBars: Schema.Attribute.Component<'sections.pipeline-bar', true>;
    pipelineTitle: Schema.Attribute.String;
    subHeadline: Schema.Attribute.String;
  };
}

export interface SectionsHeroBadge extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_badges';
  info: {
    displayName: 'Hero Badge';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsHowItWorksStep extends Struct.ComponentSchema {
  collectionName: 'components_sections_how_it_works_steps';
  info: {
    displayName: 'How It Works Step';
  };
  attributes: {
    number: Schema.Attribute.String & Schema.Attribute.Required;
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SectionsInfoCard extends Struct.ComponentSchema {
  collectionName: 'components_sections_info_cards';
  info: {
    displayName: 'Info Card';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsLogoItem extends Struct.ComponentSchema {
  collectionName: 'components_sections_logo_items';
  info: {
    displayName: 'Logo Item';
  };
  attributes: {
    alt: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsLogoMarquee extends Struct.ComponentSchema {
  collectionName: 'components_sections_logo_marquees';
  info: {
    displayName: 'Logo Marquee';
  };
  attributes: {
    heading: Schema.Attribute.String;
    logos: Schema.Attribute.Component<'sections.logo-item', true>;
  };
}

export interface SectionsPipelineBar extends Struct.ComponentSchema {
  collectionName: 'components_sections_pipeline_bars';
  info: {
    displayName: 'Pipeline Bar';
  };
  attributes: {
    color: Schema.Attribute.String & Schema.Attribute.Required;
    leftLabel: Schema.Attribute.String & Schema.Attribute.Required;
    rightLabel: Schema.Attribute.String & Schema.Attribute.Required;
    widthPct: Schema.Attribute.Integer & Schema.Attribute.Required;
  };
}

export interface SectionsProcessCard extends Struct.ComponentSchema {
  collectionName: 'components_sections_process_cards';
  info: {
    displayName: 'Process Card';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_sections_process_steps';
  info: {
    displayName: 'Process Step';
  };
  attributes: {
    cards: Schema.Attribute.Component<'sections.process-card', true>;
    dateRange: Schema.Attribute.String;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    number: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsProcessTimeline extends Struct.ComponentSchema {
  collectionName: 'components_sections_process_timelines';
  info: {
    displayName: 'Process Timeline';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    steps: Schema.Attribute.Component<'sections.process-step', true>;
    subheading: Schema.Attribute.Text;
  };
}

export interface SectionsResultsChart extends Struct.ComponentSchema {
  collectionName: 'components_sections_results_charts';
  info: {
    displayName: 'Results Chart';
  };
  attributes: {
    dataPoints: Schema.Attribute.Component<'sections.chart-data-point', true>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.Text;
  };
}

export interface SectionsSystemBullet extends Struct.ComponentSchema {
  collectionName: 'components_sections_system_bullets';
  info: {
    displayName: 'System Bullet';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsSystemTab extends Struct.ComponentSchema {
  collectionName: 'components_sections_system_tabs';
  info: {
    displayName: 'System Tab';
  };
  attributes: {
    body: Schema.Attribute.Text & Schema.Attribute.Required;
    bullets: Schema.Attribute.Component<'sections.system-bullet', true>;
    emoji: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    miniCaseStudyLabel: Schema.Attribute.String;
    miniCaseStudyText: Schema.Attribute.Text;
    tabId: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsSystemsTabs extends Struct.ComponentSchema {
  collectionName: 'components_sections_systems_tabs';
  info: {
    displayName: 'Systems Tabs';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.Text;
    tabs: Schema.Attribute.Component<'sections.system-tab', true>;
  };
}

export interface SectionsWhoItIsFor extends Struct.ComponentSchema {
  collectionName: 'components_sections_who_it_is_fors';
  info: {
    displayName: 'Who It Is For';
  };
  attributes: {
    cards: Schema.Attribute.Component<'sections.info-card', true>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    subheading: Schema.Attribute.Text;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'Frequently asked question';
    displayName: 'FAQ Item';
    icon: 'help';
  };
  attributes: {
    answer: Schema.Attribute.RichText & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    description: 'Navigation menu item';
    displayName: 'Nav Item';
    icon: 'bulletList';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: 'Rich text content block';
    displayName: 'Rich Text';
    icon: 'pencil';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'SEO metadata for pages and posts';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'Social media link';
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      ['twitter', 'linkedin', 'github', 'facebook', 'instagram', 'youtube']
    >;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'sections.calculator': SectionsCalculator;
      'sections.case-study': SectionsCaseStudy;
      'sections.chart-data-point': SectionsChartDataPoint;
      'sections.cta-section': SectionsCtaSection;
      'sections.hero': SectionsHero;
      'sections.hero-badge': SectionsHeroBadge;
      'sections.how-it-works-step': SectionsHowItWorksStep;
      'sections.info-card': SectionsInfoCard;
      'sections.logo-item': SectionsLogoItem;
      'sections.logo-marquee': SectionsLogoMarquee;
      'sections.pipeline-bar': SectionsPipelineBar;
      'sections.process-card': SectionsProcessCard;
      'sections.process-step': SectionsProcessStep;
      'sections.process-timeline': SectionsProcessTimeline;
      'sections.results-chart': SectionsResultsChart;
      'sections.system-bullet': SectionsSystemBullet;
      'sections.system-tab': SectionsSystemTab;
      'sections.systems-tabs': SectionsSystemsTabs;
      'sections.who-it-is-for': SectionsWhoItIsFor;
      'shared.faq-item': SharedFaqItem;
      'shared.nav-item': SharedNavItem;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.social-link': SharedSocialLink;
    }
  }
}
