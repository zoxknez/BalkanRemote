export type JobFeedType = 'rss';

export interface JobFeedSource {
  id: string;
  name: string;
  url: string;
  type: JobFeedType;
  category?: string;
  tags?: string[];
  region?: 'global' | 'balkan' | 'cee';
  active?: boolean; // if false, collector will skip
  maxItems?: number; // per-source cap
  filters?: {
    include?: RegExp[];
    exclude?: RegExp[];
  };
}

export const jobFeedSources: JobFeedSource[] = [
  {
    id: 'weworkremotely-dev',
    name: 'We Work Remotely – Programming',
    url: 'https://weworkremotely.com/categories/remote-programming-jobs.rss',
    type: 'rss',
    category: 'software-engineering',
    tags: ['weworkremotely', 'remote'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'remoteok',
    name: 'RemoteOK',
    url: 'https://remoteok.com/remote-jobs.rss',
    type: 'rss',
    category: 'software-engineering',
    tags: ['remoteok'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'remotive-dev',
    name: 'Remotive – Software Dev',
    url: 'https://remotive.com/remote-jobs/feed?category=software-dev',
    type: 'rss',
    category: 'software-engineering',
    tags: ['remotive'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'nofluff',
    name: 'No Fluff Jobs – Remote',
    url: 'https://nofluffjobs.com/pl/job-offer/feed?criteria=remote&categorie=frontend,backend,fullstack,testing,devops,product',
    type: 'rss',
    category: 'software-engineering',
    tags: ['nofluffjobs'],
    region: 'cee',
    active: false, // 2025-10: feed vraća neispravan XML (Unexpected close tag)
    maxItems: 30,
  },
  {
    id: 'dailyremote',
    name: 'Daily Remote – Marketing',
    url: 'https://dailyremote.com/feed/marketing',
    type: 'rss',
    category: 'marketing',
    tags: ['dailyremote'],
    region: 'global',
    active: false, // 2025-10: endpoint vraća HTTP 404
    maxItems: 30,
  },
  {
    id: 'weworkremotely-support',
    name: 'We Work Remotely – Customer Support',
    url: 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss',
    type: 'rss',
    category: 'customer-support',
    tags: ['weworkremotely'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'workingnomads',
    name: 'Working Nomads – Remote Tech',
    url: 'https://www.workingnomads.com/jobs.rss',
    type: 'rss',
    category: 'software-engineering',
    tags: ['workingnomads'],
    region: 'global',
    active: false, // 2025-10: endpoint vraća HTTP 404
    maxItems: 30,
  },
  // Additional categories and sources for breadth
  {
    id: 'weworkremotely-design',
    name: 'We Work Remotely – Design',
    url: 'https://weworkremotely.com/categories/remote-design-jobs.rss',
    type: 'rss',
    category: 'design',
    tags: ['weworkremotely'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'weworkremotely-marketing',
    name: 'We Work Remotely – Marketing',
    url: 'https://weworkremotely.com/categories/remote-marketing-jobs.rss',
    type: 'rss',
    category: 'marketing',
    tags: ['weworkremotely'],
    region: 'global',
    active: false, // 2025-10: endpoint vraća trajni HTTP 301 na HTML stranicu
    maxItems: 30,
  },
  {
    id: 'weworkremotely-sales',
    name: 'We Work Remotely – Sales',
    url: 'https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss',
    type: 'rss',
    category: 'sales',
    tags: ['weworkremotely'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'remotive-marketing',
    name: 'Remotive – Marketing',
    url: 'https://remotive.com/remote-jobs/feed?category=marketing',
    type: 'rss',
    category: 'marketing',
    tags: ['remotive'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'remotive-customer-support',
    name: 'Remotive – Customer Support',
    url: 'https://remotive.com/remote-jobs/feed?category=customer-support',
    type: 'rss',
    category: 'customer-support',
    tags: ['remotive'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'remotive-design',
    name: 'Remotive – Design',
    url: 'https://remotive.com/remote-jobs/feed?category=design',
    type: 'rss',
    category: 'design',
    tags: ['remotive'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
  {
    id: 'dailyremote-dev',
    name: 'Daily Remote – Software Dev',
    url: 'https://dailyremote.com/feed/developer',
    type: 'rss',
    category: 'software-engineering',
    tags: ['dailyremote'],
    region: 'global',
    active: false, // 2025-10: endpoint vraća HTTP 404
    maxItems: 30,
  },
  // Balkan/CEE placeholders (set active=false until verified RSS endpoints)
  {
    id: 'balkan-infostud',
    name: 'Infostud (Balkan) – placeholder',
    url: 'https://poslovi.infostud.com/rss',
    type: 'rss',
    category: 'all',
    tags: ['balkan', 'srbija', 'onsite'],
    region: 'balkan',
    active: false, // RSS format not supported
    maxItems: 30,
  },
  {
    id: 'balkan-helloworld',
    name: 'HelloWorld.rs – IT Srbija',
    url: 'https://helloworld.rs/rss',
    type: 'rss',
    category: 'software-engineering',
    tags: ['balkan', 'srbija', 'it', 'onsite'],
    region: 'balkan',
    active: true,
    maxItems: 20,
  },
  // Additional global feeds that include onsite/hybrid positions
  {
    id: 'lever-global',
    name: 'Lever – All Job Categories',
    url: 'https://lever.co/rss',
    type: 'rss',
    category: 'all',
    tags: ['lever', 'global', 'onsite', 'hybrid'],
    region: 'global',
    active: true,
    maxItems: 30,
  },
];
