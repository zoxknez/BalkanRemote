import { Job, Company, Resource, Tool } from '@/types'

// Enhanced mock data with real companies and opportunities
export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Full Stack Engineer',
    company: 'NCR Voyix',
    companyLogo: 'https://logo.clearbit.com/ncr.com',
    location: 'Remote - Serbia/Global',
    type: 'full-time',
    category: 'Software Development',
    description: 'Join NCR Voyix, a global leader in consumer transaction technologies, as a Senior Full Stack Engineer. Work on cutting-edge fintech solutions serving millions of users worldwide.',
    requirements: [
      '5+ years full-stack development experience',
      'Expert in React/TypeScript and Node.js',
      'Experience with microservices and cloud platforms (AWS/Azure)',
      'Strong problem-solving and communication skills'
    ],
    benefits: [
      'Competitive salary ($60k-$90k USD)',
      'Comprehensive health insurance',
      '$2,000 annual learning budget',
      'Flexible working hours across timezones'
    ],
    salaryMin: 60000,
    salaryMax: 90000,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'senior',
    postedAt: new Date('2024-01-15'),
    url: 'https://linkedin.com/jobs/ncr-jobs/?currentJobId=4092876160',
    featured: true,
    tags: ['React', 'TypeScript', 'Node.js', 'AWS', 'Fintech']
  },
  {
    id: '2',
    title: 'IT Project Manager - Remote',
    company: 'Clutch',
    companyLogo: 'https://logo.clearbit.com/clutch.co',
    location: 'Remote - Eastern Europe',
    type: 'full-time',
    category: 'Project Management',
    description: 'Clutch, the leading B2B ratings platform, is seeking an experienced IT Project Manager to lead cross-functional teams remotely.',
    requirements: [
      '3+ years project management experience in IT',
      'PMP or Agile certification preferred',
      'Experience with JIRA, Confluence',
      'Excellent English communication skills'
    ],
    benefits: [
      'Remote-first company culture',
      'Competitive salary package',
      'Professional development opportunities',
      'International team collaboration'
    ],
    salaryMin: 45000,
    salaryMax: 65000,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'mid',
    postedAt: new Date('2024-01-18'),
    url: 'https://clutch.co/it-services',
    featured: true,
    tags: ['Project Management', 'Agile', 'JIRA', 'B2B']
  },
  {
    id: '3',
    title: 'Online English Teacher',
    company: 'Good Air Language',
    location: 'Remote - Global',
    type: 'part-time',
    category: 'Education',
    description: 'Good Air Language connects passionate English teachers with students worldwide through innovative online platform.',
    requirements: [
      'Native English speaker or C2 proficiency',
      'TESOL, TEFL, or CELTA certification',
      'Previous teaching experience preferred',
      'Reliable internet connection'
    ],
    benefits: [
      'Flexible scheduling - choose your hours',
      'Competitive hourly rates ($15-$25/hour)',
      'Work from anywhere in the world',
      'Performance bonuses available'
    ],
    salaryMin: 15,
    salaryMax: 25,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'mid',
    postedAt: new Date('2024-01-20'),
    url: 'https://www.goodairlanguage.com/teaching-english-online-2/',
    featured: true,
    tags: ['English Teaching', 'ESL', 'Online Education', 'Global']
  },
  {
    id: '4',
    title: 'Remote Customer Success Manager',
    company: 'LinkedIn Remote Jobs',
    companyLogo: 'https://logo.clearbit.com/linkedin.com',
    location: 'Remote - EMEA',
    type: 'full-time',
    category: 'Customer Success',
    description: 'Join LinkedIn\'s growing remote workforce! Help enterprise clients maximize their LinkedIn recruitment solutions. One of 480+ remote positions available.',
    requirements: [
      '3+ years B2B customer success experience',
      'Strong analytical and communication skills',
      'Experience with CRM systems (Salesforce preferred)',
      'Fluent English, additional European languages a plus'
    ],
    benefits: [
      'LinkedIn stock options and bonuses',
      'Comprehensive health and wellness programs',
      'Professional development and LinkedIn Learning access',
      'Remote work stipend for home office'
    ],
    salaryMin: 55000,
    salaryMax: 75000,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'mid',
    postedAt: new Date('2024-01-22'),
    url: 'https://linkedin.com/jobs/search/?f_WT=2&location=Serbia',
    featured: true,
    tags: ['Customer Success', 'B2B', 'CRM', 'LinkedIn']
  },
  {
    id: '5',
    title: 'Frontend Developer (React)',
    company: 'Joberty',
    location: 'Remote - Serbia',
    type: 'full-time',
    category: 'Software Development',
    description: 'Joberty, the leading tech job platform, is looking for a Frontend Developer to build responsive applications.',
    requirements: [
      '2+ years React.js development experience',
      'Strong knowledge of HTML5, CSS3, JavaScript ES6+',
      'Experience with state management (Redux/Context API)',
      'Understanding of responsive design'
    ],
    benefits: [
      'Remote work from Serbia',
      'Competitive salary in EUR',
      'Modern tech stack and tools',
      'Career growth opportunities'
    ],
    salaryMin: 35000,
    salaryMax: 50000,
    currency: 'EUR',
    isRemote: true,
    experienceLevel: 'mid',
    postedAt: new Date('2024-01-25'),
    url: 'https://joberty.com',
    featured: false,
    tags: ['React', 'Frontend', 'JavaScript', 'Remote Serbia']
  },
  {
    id: '6',
    title: 'Digital Marketing Specialist',
    company: 'SkillCrush Remote Team',
    location: 'Remote - Worldwide',
    type: 'full-time',
    category: 'Marketing',
    description: 'SkillCrush is seeking a Digital Marketing Specialist to create campaigns that inspire people to break into tech.',
    requirements: [
      '2+ years digital marketing experience',
      'Content creation and copywriting skills',
      'Experience with Google Analytics, Facebook Ads',
      'Knowledge of email marketing platforms'
    ],
    benefits: [
      'Work from anywhere policy',
      'Professional development budget',
      'Flexible working hours',
      'Mission-driven work environment'
    ],
    salaryMin: 40000,
    salaryMax: 55000,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'mid',
    postedAt: new Date('2024-01-28'),
    url: 'https://skillcrush.com',
    featured: false,
    tags: ['Digital Marketing', 'Content Creation', 'SEO', 'EdTech']
  }
]

export const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'NCR Voyix',
    logo: 'https://logo.clearbit.com/ncr.com',
    description: 'Global leader in consumer transaction technologies, serving banks, retailers, restaurants and more across 180+ countries.',
    website: 'https://www.ncr.com',
    linkedin: 'https://linkedin.com/company/ncr-corporation',
    size: '30000+ employees',
    industry: 'Technology',
    location: 'Global (Remote-First)',
    foundedYear: 1884,
    isHiring: true,
    openPositions: 25,
    benefits: ['Health Insurance', 'Stock Options', 'Learning Budget', 'Flexible PTO'],
    techStack: ['Java', 'React', 'Node.js', 'AWS', 'Kubernetes'],
    rating: 4.2,
    reviewCount: 2847
  },
  {
    id: '2',
    name: 'Clutch',
    logo: 'https://logo.clearbit.com/clutch.co',
    description: 'Leading B2B ratings and reviews platform connecting businesses with top service providers worldwide.',
    website: 'https://clutch.co',
    linkedin: 'https://linkedin.com/company/clutch',
    size: '500-1000 employees',
    industry: 'Technology/Marketing',
    location: 'Washington DC (Remote-Friendly)',
    foundedYear: 2012,
    isHiring: true,
    openPositions: 12,
    benefits: ['Remote Work', 'Health Coverage', 'Professional Development', 'Flexible Hours'],
    techStack: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS'],
    rating: 4.5,
    reviewCount: 156
  },
  {
    id: '3',
    name: 'Good Air Language',
    description: 'Online language learning platform connecting students with qualified teachers for personalized English instruction.',
    website: 'https://www.goodairlanguage.com',
    size: '50-100 employees',
    industry: 'Education',
    location: 'Global (Fully Remote)',
    foundedYear: 2018,
    isHiring: true,
    openPositions: 8,
    benefits: ['Flexible Schedule', 'Competitive Rates', 'Global Community', 'Training Support'],
    techStack: ['Zoom', 'Custom LMS', 'Mobile Apps'],
    rating: 4.7,
    reviewCount: 89
  },
  {
    id: '4',
    name: 'LinkedIn',
    logo: 'https://logo.clearbit.com/linkedin.com',
    description: 'The world\'s largest professional networking platform with 900+ million members globally.',
    website: 'https://linkedin.com',
    linkedin: 'https://linkedin.com/company/linkedin',
    size: '20000+ employees',
    industry: 'Technology',
    location: 'Global (Hybrid/Remote Options)',
    foundedYear: 2003,
    isHiring: true,
    openPositions: 480,
    benefits: ['Stock Options', 'Unlimited PTO', 'Learning Stipend', 'Wellness Programs'],
    techStack: ['Java', 'Scala', 'Python', 'React', 'Kafka', 'Hadoop'],
    rating: 4.4,
    reviewCount: 5632
  },
  {
    id: '5',
    name: 'SkillCrush',
    description: 'Online learning platform focused on making tech careers accessible through comprehensive coding bootcamps and courses.',
    website: 'https://skillcrush.com',
    size: '50-100 employees',
    industry: 'Education',
    location: 'USA (Fully Remote)',
    foundedYear: 2012,
    isHiring: false,
    openPositions: 3,
    benefits: ['Remote-First', 'Learning Access', 'Mission-Driven', 'Flexible Hours'],
    techStack: ['Ruby on Rails', 'JavaScript', 'WordPress', 'Stripe'],
    rating: 4.3,
    reviewCount: 67
  }
]

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'LinkedIn Remote Jobs - 480+ pozicija za Srbiju',
    description: 'Najveća baza remote poslova na LinkedIn-u specijalno filtrirana za kandidate iz Srbije i regiona.',
    url: 'https://linkedin.com/jobs/search/?f_WT=2&location=Serbia',
    category: 'sajt',
    type: 'besplatno',
    rating: 4.8,
    language: 'en',
    tags: ['LinkedIn', 'Job Search', 'Remote Work', 'Serbia'],
    author: 'LinkedIn',
    difficulty: 'beginner',
    timeToComplete: '30 min daily'
  },
  {
    id: '2',
    title: 'Remote.co - Premium Remote Job Board',
    description: 'Kuratovana lista kvalitetnih remote poslova od proverenih kompanija širom sveta.',
    url: 'https://remote.co',
    category: 'sajt',
    type: 'freemium',
    rating: 4.6,
    language: 'en',
    tags: ['Job Board', 'Quality Jobs', 'Global'],
    author: 'Remote.co',
    difficulty: 'beginner',
    timeToComplete: '20 min daily'
  },
  {
    id: '3',
    title: 'AngelList (Wellfound) Startup Jobs',
    description: 'Najbolja platforma za pronalaženje poslova u startup kompanijama koje nude remote opcije.',
    url: 'https://wellfound.com',
    category: 'sajt',
    type: 'besplatno',
    rating: 4.5,
    language: 'en',
    tags: ['Startups', 'Equity', 'Tech Jobs'],
    author: 'Wellfound',
    difficulty: 'intermediate',
    timeToComplete: '45 min setup'
  },
  {
    id: '4',
    title: 'Complete Remote Work Course',
    description: 'Sveobuhvatan kurs o remote radu - od pronalaska posla do upravljanja produktivnošću.',
    url: 'https://coursera.org/remote-work',
    category: 'kurs',
    type: 'placeno',
    rating: 4.7,
    language: 'en',
    tags: ['Course', 'Productivity', 'Career'],
    author: 'Coursera',
    difficulty: 'beginner',
    timeToComplete: '4 weeks'
  },
  {
    id: '5',
    title: 'Remote Work Hub Blog',
    description: 'Najbolji blog o remote radu sa praktičnim savetima, intervjuima i analizama trendova.',
    url: 'https://remoteworkhub.com/blog',
    category: 'blog',
    type: 'besplatno',
    rating: 4.4,
    language: 'en',
    tags: ['Blog', 'Tips', 'Trends', 'Community'],
    author: 'Remote Work Hub',
    difficulty: 'beginner',
    timeToComplete: '10 min per article'
  },
  {
    id: '6',
    title: 'Distributed Work\'s Toolkit',
    description: 'Podkast o distributed radu sa intervjuima lidera remote-first kompanija.',
    url: 'https://distributedwork.com/podcast',
    category: 'podcast',
    type: 'besplatno',
    rating: 4.6,
    language: 'en',
    tags: ['Podcast', 'Leadership', 'Company Culture'],
    author: 'Distributed Work',
    difficulty: 'intermediate',
    timeToComplete: '45 min per episode'
  },
  {
    id: '7',
    title: 'Remote: Office Not Required',
    description: 'Klasična knjiga o remote radu od osnivača Basecamp-a - must-read za sve remote radnike.',
    url: 'https://basecamp.com/books/remote',
    category: 'knjiga',
    type: 'placeno',
    rating: 4.9,
    language: 'en',
    tags: ['Book', 'Basecamp', 'Philosophy', 'Culture'],
    author: 'Jason Fried & David Heinemeier Hansson',
    difficulty: 'beginner',
    timeToComplete: '3-4 hours'
  },
  {
    id: '8',
    title: 'Zapier Remote Work Guide',
    description: 'Besplatan vodič kroz remote rad od kompanije koja je 100% remote od osnivanja.',
    url: 'https://zapier.com/learn/remote-work/',
    category: 'alat',
    type: 'besplatno',
    rating: 4.8,
    language: 'en',
    tags: ['Guide', 'Zapier', 'Best Practices'],
    author: 'Zapier',
    difficulty: 'beginner',
    timeToComplete: '2 hours'
  },
  {
    id: '9',
    title: 'Nomad List - Digital Nomad Community',
    description: 'Najveća zajednica digitalnih nomada sa informacijama o gradovima, WiFi-ju, troškovima života.',
    url: 'https://nomadlist.com',
    category: 'sajt',
    type: 'freemium',
    rating: 4.3,
    language: 'en',
    tags: ['Digital Nomad', 'Travel', 'Community'],
    author: 'Nomad List',
    difficulty: 'intermediate',
    timeToComplete: '1 hour exploration'
  },
  {
    id: '10',
    title: 'The Remote Work Revolution',
    description: 'Najnovija knjiga o budućnosti remote rada i kako se pripremiti za nove načine rada.',
    url: 'https://amazon.com/remote-work-revolution',
    category: 'knjiga',
    type: 'placeno',
    rating: 4.5,
    language: 'en',
    tags: ['Book', 'Future of Work', 'Trends'],
    author: 'Tsedal Neeley',
    difficulty: 'advanced',
    timeToComplete: '5-6 hours'
  }
]

export const mockTools: Tool[] = [
  {
    id: '1',
    name: 'Slack',
    description: 'Vodeća platforma za tim komunikaciju sa naprednim organizacionim mogućnostima.',
    url: 'https://slack.com',
    category: 'komunikacija',
    pricing: 'freemium',
    rating: 4.8,
    userCount: '12M+ daily users',
    features: [
      'Unlimited channels and DMs',
      'File sharing and screen sharing',
      'Voice and video calls',
      'App integrations (2000+)',
      'Advanced search capabilities'
    ],
    pros: [
      'Intuitivni interface',
      'Odlične integracije',
      'Moćan search',
      'Customizable notifications'
    ],
    cons: [
      'Može biti overwhelming za početnike',
      'Skupo za veće timove',
      'Thread conversations mogu biti confusing'
    ],
    alternatives: ['Microsoft Teams', 'Discord', 'Mattermost'],
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    name: 'Zoom',
    description: 'Najpopularnija platforma za video konferencije sa profesionalnim mogućnostima.',
    url: 'https://zoom.us',
    category: 'komunikacija',
    pricing: 'freemium',
    rating: 4.7,
    userCount: '300M+ participants daily',
    features: [
      'HD video and audio',
      'Screen sharing and whiteboard',
      'Recording and transcription',
      'Breakout rooms',
      'Virtual backgrounds'
    ],
    pros: [
      'Stabilan i pouzdan',
      'Dobra kvaliteta videa',
      'Jednostavan za korišćenje',
      'Dobra mobile aplikacija'
    ],
    cons: [
      'Bezbednosni problemi u prošlosti',
      'Ograničeno vreme za besplatne planove',
      'Može biti resource intensive'
    ],
    alternatives: ['Google Meet', 'Microsoft Teams', 'WebEx'],
    lastUpdated: '2024-01-12'
  },
  {
    id: '3',
    name: 'Notion',
    description: 'All-in-one workspace za note-taking, project management, i knowledge management.',
    url: 'https://notion.so',
    category: 'produktivnost',
    pricing: 'freemium',
    rating: 4.6,
    userCount: '20M+ users',
    features: [
      'Notes, docs, and wikis',
      'Kanban boards and calendars',
      'Database functionality',
      'Templates and collaboration',
      'AI writing assistant'
    ],
    pros: [
      'Vrlo fleksibilan i customizable',
      'Odličan za team collaboration',
      'Mnoštvo template-ova',
      'Clean, modern interface'
    ],
    cons: [
      'Može biti slow za velike baze podataka',
      'Steep learning curve',
      'Offline functionality ograničena'
    ],
    alternatives: ['Obsidian', 'Roam Research', 'Coda'],
    lastUpdated: '2024-01-10'
  },
  {
    id: '4',
    name: 'Figma',
    description: 'Colaborativni design tool za UI/UX dizajn sa real-time funkcionalnostima.',
    url: 'https://figma.com',
    category: 'design',
    pricing: 'freemium',
    rating: 4.9,
    userCount: '4M+ designers',
    features: [
      'Vector graphics and prototyping',
      'Real-time collaboration',
      'Component libraries',
      'Version history',
      'Developer handoff tools'
    ],
    pros: [
      'Najbolji collaborative features',
      'Browser-based - no installation',
      'Odličan za prototyping',
      'Strong developer tools'
    ],
    cons: [
      'Zahteva internet konekciju',
      'Može biti slow za kompleksne fajlove',
      'Ograničen broj editor-a na free planu'
    ],
    alternatives: ['Adobe XD', 'Sketch', 'Framer'],
    lastUpdated: '2024-01-08'
  },
  {
    id: '5',
    name: 'Trello',
    description: 'Vizuelni project management tool baziran na Kanban board sistemu.',
    url: 'https://trello.com',
    category: 'project-management',
    pricing: 'freemium',
    rating: 4.5,
    userCount: '50M+ users',
    features: [
      'Kanban boards and cards',
      'Due dates and checklists',
      'File attachments',
      'Team collaboration',
      'Power-ups and automation'
    ],
    pros: [
      'Vrlo jednostavan za korišćenje',
      'Visual workflow',
      'Dobra mobile aplikacija',
      'Lots of integrations'
    ],
    cons: [
      'Limitiran za kompleksne projekte',
      'Nema built-in time tracking',
      'Reporting capabilities su basic'
    ],
    alternatives: ['Asana', 'Monday.com', 'ClickUp'],
    lastUpdated: '2024-01-05'
  },
  {
    id: '6',
    name: 'Toggle Track',
    description: 'Profesionalni time tracking tool za freelance-re i timove.',
    url: 'https://toggl.com',
    category: 'time-tracking',
    pricing: 'freemium',
    rating: 4.7,
    userCount: '5M+ users',
    features: [
      'One-click time tracking',
      'Project and client organization',
      'Detailed reporting and analytics',
      'Team time tracking',
      'Integrations with 100+ tools'
    ],
    pros: [
      'Jednostavan i brz za korišćenje',
      'Detaljni reporti',
      'Dobra mobile aplikacija',
      'Offline tracking'
    ],
    cons: [
      'UI može biti outdated',
      'Advanced features samo na plaćenim planovima',
      'Može biti overkill za jednostavne potrebe'
    ],
    alternatives: ['RescueTime', 'Clockify', 'Harvest'],
    lastUpdated: '2024-01-03'
  },
  {
    id: '7',
    name: 'GitLab',
    description: 'Kompletna DevOps platforma sa Git repository, CI/CD, i project management.',
    url: 'https://gitlab.com',
    category: 'development',
    pricing: 'freemium',
    rating: 4.6,
    userCount: '30M+ registered users',
    features: [
      'Git repository management',
      'CI/CD pipelines',
      'Issue tracking',
      'Wiki and documentation',
      'Security scanning'
    ],
    pros: [
      'All-in-one DevOps solution',
      'Odličan free tier',
      'Self-hosted options',
      'Strong security features'
    ],
    cons: [
      'Može biti kompleksan za početnike',
      'UI može biti overwhelming',
      'Performance issues sa velikim projektima'
    ],
    alternatives: ['GitHub', 'Bitbucket', 'Azure DevOps'],
    lastUpdated: '2024-01-01'
  },
  {
    id: '8',
    name: 'Stripe',
    description: 'Moderna platforma za online plaćanja i finansijski management.',
    url: 'https://stripe.com',
    category: 'finance',
    pricing: 'placeno',
    rating: 4.8,
    userCount: 'Millions of businesses',
    features: [
      'Payment processing',
      'Subscription management',
      'Invoice creation',
      'Financial reporting',
      'Multi-currency support'
    ],
    pros: [
      'Najbolji developer experience',
      'Transparentno pricing',
      'Excellent documentation',
      'Global reach'
    ],
    cons: [
      'Transaction fees mogu biti skupi',
      'Customer support može biti slow',
      'Kompleksan za jednostavne potrebe'
    ],
    alternatives: ['PayPal', 'Square', 'Wise Business'],
    lastUpdated: '2023-12-28'
  },
  {
    id: '9',
    name: 'Loom',
    description: 'Screen recording tool za brzo kreiranje video poruka i tutorjala.',
    url: 'https://loom.com',
    category: 'komunikacija',
    pricing: 'freemium',
    rating: 4.7,
    userCount: '14M+ users',
    features: [
      'Screen and camera recording',
      'Instant sharing links',
      'Video editing tools',
      'Viewer analytics',
      'Team libraries'
    ],
    pros: [
      'Vrlo brz i jednostavan',
      'Dobra kvaliteta videa',
      'Instant sharing',
      'Good mobile app'
    ],
    cons: [
      'Ograničeno editing mogućnosti',
      'Free plan ima limits',
      'Može biti slow upload'
    ],
    alternatives: ['Screencastify', 'Camtasia', 'CloudApp'],
    lastUpdated: '2023-12-25'
  },
  {
    id: '10',
    name: 'Calendly',
    description: 'Automated scheduling tool za booking meetings bez email ping-pong-a.',
    url: 'https://calendly.com',
    category: 'produktivnost',
    pricing: 'freemium',
    rating: 4.6,
    userCount: '10M+ users',
    features: [
      'Automated scheduling',
      'Calendar integrations',
      'Custom booking pages',
      'Meeting preferences',
      'Analytics and insights'
    ],
    pros: [
      'Drastično reduces back-and-forth emails',
      'Professional booking pages',
      'Multiple calendar integration',
      'Time zone detection'
    ],
    cons: [
      'Može biti impersonal',
      'Limited customization na free planu',
      'Advanced features su skupi'
    ],
    alternatives: ['Acuity', 'YouCanBook.me', 'ScheduleOnce'],
    lastUpdated: '2023-12-20'
  }
]
