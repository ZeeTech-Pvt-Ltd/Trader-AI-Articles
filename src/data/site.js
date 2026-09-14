// Site-wide config and copy for Trader AI.
export const SITE = {
  name: 'Trader AI',
  tagline: 'Safe, Legit or a Scam? Our Verdicts',
  domain: 'trader-ai.com',
  url: 'https://trader-ai.com/',
  byline: 'The Editorial Desk',
  contactEmail: 'contact@trader-ai.com',
  description:
    'Trader AI reviews for 2026: we read what each platform claims, check what it publishes, and hand down a verdict - safe, legit or a scam.',
}

export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Reviews', to: '/#reviews' },
]

// The five dimensions behind every scorecard.
export const RATING_DIMENSIONS = [
  {
    key: 'easeOfUse',
    name: 'Ease of use',
    text: 'How quickly a newcomer can sign up, fund an account and place a first trade - and whether the dashboard explains itself as it goes.',
  },
  {
    key: 'features',
    name: 'Features',
    text: 'The breadth of the toolset: automation, signals, asset coverage, reporting and anything else the platform actually ships.',
  },
  {
    key: 'transparency',
    name: 'Transparency',
    text: 'Whether pricing, minimum deposits, risk warnings and company information are published openly - or need to be chased down.',
  },
  {
    key: 'security',
    name: 'Security & regulation',
    text: 'The security measures the platform discloses - encryption, 2FA, custody - and whether any regulator or licence is named on the site.',
  },
  {
    key: 'support',
    name: 'Support',
    text: 'How the platform says it can be reached: published contact details, hours and the realism of the promises made.',
  },
]

export const FAQ_GENERAL = [
  {
    q: 'What is Trader AI?',
    a: 'Trader AI is an editorial publication that reviews AI-powered trading and investing platforms marketed to users around the world. Each review reads the platform’s own published material - features, fees, security claims and disclosures - and hands down a verdict you can act on.',
  },
  {
    q: 'Do you test the platforms yourself?',
    a: 'Our reviews are desk reviews: we go through every public page, claim, fee note and disclosure a platform publishes, and we flag what it does not publish. We do not manage client funds, take deposits or place trades on any reviewed platform.',
  },
  {
    q: 'How do you score a platform?',
    a: 'Every platform is scored on five dimensions - ease of use, features, transparency, security & regulation, and support - each out of five. The overall rating is the average of those five scores, rounded to one decimal.',
  },
  {
    q: 'Are your reviews financial advice?',
    a: 'No. Nothing on this site is personal financial advice, and past performance never guarantees future results. Trading and investing involve risk, and you can lose money. Read each platform’s own risk disclosure before you open an account.',
  },
  {
    q: 'Do you earn money from the platforms you review?',
    a: 'Some outbound links on this site are affiliate links, which means we may receive a commission if you open an account through them. That never changes a score or a verdict - our scoring criteria are fixed and published. See our Advertising Disclosure page for details.',
  },
]
