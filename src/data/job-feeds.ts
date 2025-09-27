export type JobFeedType = 'rss';

export interface JobFeedSource {
  id: string;
  name: string;
  url: string;
  type: JobFeedType;
  category?: string;
  tags?: string[];
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
  },
  {
    id: 'remoteok',
    name: 'RemoteOK',
    url: 'https://remoteok.com/remote-jobs.rss',
    type: 'rss',
    category: 'software-engineering',
    tags: ['remoteok'],
  },
  {
    id: 'remotive-dev',
    name: 'Remotive – Software Dev',
    url: 'https://remotive.com/remote-jobs/feed?category=software-dev',
    type: 'rss',
    category: 'software-engineering',
    tags: ['remotive'],
  },
  {
    id: 'nofluff',
    name: 'No Fluff Jobs – Remote',
    url: 'https://nofluffjobs.com/pl/job-offer/feed?criteria=remote&categorie=frontend,backend,fullstack,testing,devops,product',
    type: 'rss',
    category: 'software-engineering',
    tags: ['nofluffjobs'],
  },
  {
    id: 'dailyremote',
    name: 'Daily Remote – Marketing',
    url: 'https://dailyremote.com/feed/marketing',
    type: 'rss',
    category: 'marketing',
    tags: ['dailyremote'],
  },
  {
    id: 'weworkremotely-support',
    name: 'We Work Remotely – Customer Support',
    url: 'https://weworkremotely.com/categories/remote-customer-support-jobs.rss',
    type: 'rss',
    category: 'customer-support',
    tags: ['weworkremotely'],
  },
  {
    id: 'workingnomads',
    name: 'Working Nomads – Remote Tech',
    url: 'https://www.workingnomads.com/jobs.rss',
    type: 'rss',
    category: 'software-engineering',
    tags: ['workingnomads'],
  },
  {
    id: 'stackoverflow-remote',
    name: 'Stack Overflow Remote',
    url: 'https://stackoverflow.com/jobs/feed?sort=p&l=Remote',
    type: 'rss',
    category: 'software-engineering',
    tags: ['stackoverflow'],
  },
];
