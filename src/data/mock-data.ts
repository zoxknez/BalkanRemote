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
  },
  {
    id: '7',
    title: 'DevOps Engineer',
    company: 'GitLab',
    companyLogo: 'https://logo.clearbit.com/gitlab.com',
    location: 'Remote - Europe',
    type: 'full-time',
    category: 'DevOps',
    description: 'Join GitLab, the world\'s largest all-remote company, as a DevOps Engineer working on scalable infrastructure.',
    requirements: [
      '4+ years DevOps/SRE experience',
      'Strong knowledge of Kubernetes, Docker',
      'Experience with CI/CD pipelines',
      'Cloud platforms (AWS, GCP, Azure)'
    ],
    benefits: [
      'All-remote culture pioneer',
      'Competitive salary ($70k-$95k USD)',
      'Unlimited PTO policy',
      'Home office setup allowance'
    ],
    salaryMin: 70000,
    salaryMax: 95000,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'senior',
    postedAt: new Date('2024-01-20'),
    url: 'https://about.gitlab.com/jobs/',
    featured: true,
    tags: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'GitLab']
  },
  {
    id: '8',
    title: 'UX/UI Designer',
    company: 'Figma',
    companyLogo: 'https://logo.clearbit.com/figma.com',
    location: 'Remote - US/EU timezones',
    type: 'full-time',
    category: 'Design',
    description: 'Design the future of design tools at Figma. Work on products used by millions of designers worldwide.',
    requirements: [
      '3+ years product design experience',
      'Strong portfolio of digital products',
      'Experience with design systems',
      'Collaborative mindset and communication skills'
    ],
    benefits: [
      'Remote-first company culture',
      'Equity participation program',
      'Top-tier health benefits',
      'Annual learning & development budget'
    ],
    salaryMin: 85000,
    salaryMax: 120000,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'mid',
    postedAt: new Date('2024-01-18'),
    url: 'https://www.figma.com/careers/',
    featured: true,
    tags: ['UI/UX Design', 'Figma', 'Design Systems', 'Product Design']
  },
  {
    id: '9',
    title: 'Customer Success Manager',
    company: 'Zapier',
    companyLogo: 'https://logo.clearbit.com/zapier.com',
    location: 'Remote - Global',
    type: 'full-time',
    category: 'Customer Success',
    description: 'Help customers succeed with automation at Zapier, a 100% remote company since 2011.',
    requirements: [
      '2+ years customer success experience',
      'Strong communication skills',
      'Experience with SaaS products',
      'Problem-solving mindset'
    ],
    benefits: [
      'Distributed team pioneer',
      'Flexible working arrangements',
      'Comprehensive wellness programs',
      'Annual team retreat'
    ],
    salaryMin: 45000,
    salaryMax: 65000,
    currency: 'USD',
    isRemote: true,
    experienceLevel: 'mid',
    postedAt: new Date('2024-01-22'),
    url: 'https://zapier.com/jobs/',
    featured: false,
    tags: ['Customer Success', 'SaaS', 'Automation', 'Remote Culture']
  },
  {
    id: '10',
    title: 'Junior Web Developer',
    company: 'Toptal',
    companyLogo: 'https://logo.clearbit.com/toptal.com',
    location: 'Remote - Eastern Europe',
    type: 'contract',
    category: 'Software Development',
    description: 'Join Toptal\'s exclusive network as a Junior Web Developer. Work with top companies on exciting projects.',
    requirements: [
      '1+ years web development experience',
      'Proficient in HTML, CSS, JavaScript',
      'Familiarity with React or Vue.js',
      'Strong English communication'
    ],
    benefits: [
      'Flexible project-based work',
      'Access to exclusive client projects',
      'Professional development opportunities',
      'Global remote community'
    ],
    salaryMin: 25,
    salaryMax: 45,
    currency: 'USD/hour',
    isRemote: true,
    experienceLevel: 'entry',
    postedAt: new Date('2024-01-24'),
    url: 'https://www.toptal.com/developers/join',
    featured: false,
    tags: ['Junior Developer', 'JavaScript', 'React', 'Contract Work']
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
  },
  {
    id: '6',
    name: 'GitLab',
    logo: 'https://logo.clearbit.com/gitlab.com',
    description: 'The world\'s largest all-remote company and leading DevOps platform serving 30M+ users.',
    website: 'https://about.gitlab.com',
    linkedin: 'https://linkedin.com/company/gitlab-com',
    size: '1300+ employees',
    industry: 'DevOps Platform',
    location: '65+ countries (All-Remote)',
    foundedYear: 2011,
    isHiring: true,
    openPositions: 25,
    benefits: ['All-remote pioneer', 'Transparent culture', 'Unlimited PTO', 'Home office budget'],
    techStack: ['Ruby on Rails', 'Vue.js', 'Go', 'Kubernetes'],
    rating: 4.6,
    reviewCount: 1200
  },
  {
    id: '7',
    name: 'Figma',
    logo: 'https://logo.clearbit.com/figma.com',
    description: 'Collaborative design platform used by millions of designers and developers worldwide.',
    website: 'https://www.figma.com',
    linkedin: 'https://linkedin.com/company/figma',
    size: '800+ employees',
    industry: 'Design & Collaboration Tools',
    location: 'Remote-First, Global',
    foundedYear: 2012,
    isHiring: true,
    openPositions: 15,
    benefits: ['Remote-first culture', 'Equity program', 'Learning budget', 'Wellness stipend'],
    techStack: ['TypeScript', 'React', 'C++', 'WebAssembly'],
    rating: 4.8,
    reviewCount: 890
  },
  {
    id: '8',
    name: 'Zapier',
    logo: 'https://logo.clearbit.com/zapier.com',
    description: 'Automation platform connecting 5000+ apps, 100% remote since 2011.',
    website: 'https://zapier.com',
    linkedin: 'https://linkedin.com/company/zapier',
    size: '400+ employees',
    industry: 'Automation & Integration',
    location: 'Distributed, Global',
    foundedYear: 2011,
    isHiring: true,
    openPositions: 12,
    benefits: ['Remote pioneer', 'No office policy', 'Retreat budget', 'Wellness programs'],
    techStack: ['Python', 'Django', 'JavaScript', 'React'],
    rating: 4.7,
    reviewCount: 540
  },
  {
    id: '9',
    name: 'Toptal',
    logo: 'https://logo.clearbit.com/toptal.com',
    description: 'Exclusive network of top 3% freelance developers, designers, and finance experts.',
    website: 'https://www.toptal.com',
    linkedin: 'https://linkedin.com/company/toptal',
    size: '1000+ employees',
    industry: 'Freelance Marketplace',
    location: 'Remote-First, 100+ countries',
    foundedYear: 2010,
    isHiring: true,
    openPositions: 8,
    benefits: ['Elite network', 'Flexible work', 'Premium clients', 'Global opportunities'],
    techStack: ['Ruby on Rails', 'React', 'Node.js', 'AWS'],
    rating: 4.4,
    reviewCount: 320
  },
  {
    id: '10',
    name: 'Buffer',
    logo: 'https://logo.clearbit.com/buffer.com',
    description: 'Social media management platform with transparent, all-remote culture and 4-day work week.',
    website: 'https://buffer.com',
    linkedin: 'https://linkedin.com/company/buffer',
    size: '100+ employees',
    industry: 'Social Media Management',
    location: 'Distributed, Global',
    foundedYear: 2010,
    isHiring: false,
    openPositions: 3,
    benefits: ['Transparent salaries', 'All-remote culture', '4-day work week', 'Diversity focus'],
    techStack: ['React', 'Node.js', 'MongoDB', 'AWS'],
    rating: 4.5,
    reviewCount: 280
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
  },
  {
    id: '11',
    title: 'FlexJobs - Premium Remote Job Board',
    description: 'Hand-screened remote, part-time, freelance i flexible job opportunities od proverenih kompanija.',
    url: 'https://flexjobs.com',
    category: 'sajt',
    type: 'placeno',
    rating: 4.7,
    language: 'en',
    tags: ['Job Board', 'Curated Jobs', 'Flexible Work', 'Premium'],
    author: 'FlexJobs',
    difficulty: 'beginner',
    timeToComplete: '30 min daily browsing'
  },
  {
    id: '12',
    title: 'We Work Remotely Job Board',
    description: 'Najveći job board za remote poslove sa preko 3M monthly visitors.',
    url: 'https://weworkremotely.com',
    category: 'sajt',
    type: 'besplatno',
    rating: 4.5,
    language: 'en',
    tags: ['Job Board', 'Remote Jobs', 'Tech Jobs', 'Freelance'],
    author: 'We Work Remotely',
    difficulty: 'beginner',
    timeToComplete: '20 min daily'
  },
  {
    id: '13',
    title: 'Remote Year - Travel Program',
    description: 'Program za remote radnike koji žele da putuju svetom dok rade - zajednice u 50+ gradova.',
    url: 'https://remoteyear.com',
    category: 'alat',
    type: 'placeno',
    rating: 4.8,
    language: 'en',
    tags: ['Travel', 'Community', 'Digital Nomad', 'Program'],
    author: 'Remote Year',
    difficulty: 'advanced',
    timeToComplete: '1-12 months commitment'
  },
  {
    id: '14',
    title: 'Async Remote Work Course by GitLab',
    description: 'Besplatni kurs o asinhronom radu od najveće all-remote kompanije na svetu.',
    url: 'https://about.gitlab.com/company/culture/all-remote/learning/',
    category: 'kurs',
    type: 'besplatno',
    rating: 4.9,
    language: 'en',
    tags: ['Course', 'Async Work', 'GitLab', 'Best Practices'],
    author: 'GitLab',
    difficulty: 'intermediate',
    timeToComplete: '3-4 hours'
  },
  {
    id: '15',
    title: 'Remote Tools Weekly Newsletter',
    description: 'Nedeljni newsletter sa najnovijim alatkama, trikovima i resursima za remote rad.',
    url: 'https://remotetools.io/newsletter',
    category: 'newsletter',
    type: 'besplatno',
    rating: 4.4,
    language: 'en',
    tags: ['Newsletter', 'Tools', 'Weekly', 'Remote Work'],
    author: 'Remote Tools',
    difficulty: 'beginner',
    timeToComplete: '5 min weekly read'
  },
  {
    id: '16',
    title: 'AWS Certified Solutions Architect',
    description: 'Najtraženiji cloud computing sertifikat za remote developerе - garantovano povećanje plate.',
    url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
    category: 'kurs',
    type: 'placeno',
    rating: 4.8,
    language: 'en',
    tags: ['AWS', 'Cloud Computing', 'Certification', 'High Salary'],
    author: 'Amazon Web Services',
    difficulty: 'advanced',
    timeToComplete: '3-6 months preparation'
  },
  {
    id: '17',
    title: 'GitHub Copilot Documentation',
    description: 'Kompletna dokumentacija za AI pair programming sa GitHub Copilot - budućnost kodiranja.',
    url: 'https://docs.github.com/en/copilot',
    category: 'alat',
    type: 'besplatno',
    rating: 4.7,
    language: 'en',
    tags: ['AI', 'Programming', 'GitHub', 'Documentation'],
    author: 'GitHub',
    difficulty: 'intermediate',
    timeToComplete: '2 hours reading'
  },
  {
    id: '18',
    title: 'Indie Hackers Community',
    description: 'Zajednica solo preduzetnika koji grade profitable online biznis - inspiracija i networking.',
    url: 'https://indiehackers.com',
    category: 'sajt',
    type: 'freemium',
    rating: 4.6,
    language: 'en',
    tags: ['Entrepreneurship', 'Solo Business', 'Community', 'Inspiration'],
    author: 'Indie Hackers',
    difficulty: 'intermediate',
    timeToComplete: '30 min daily networking'
  },
  {
    id: '19',
    title: 'Design+Code iOS App Development',
    description: 'Premium kurs za iOS app development sa SwiftUI - od početnika do published app-a.',
    url: 'https://designcode.io',
    category: 'kurs',
    type: 'placeno',
    rating: 4.9,
    language: 'en',
    tags: ['iOS Development', 'SwiftUI', 'Mobile Apps', 'Design'],
    author: 'Meng To',
    difficulty: 'intermediate',
    timeToComplete: '40+ hours content'
  },
  {
    id: '20',
    title: 'The Changelog Podcast',
    description: 'Najpopularniji developer podkast sa intervjuima open source maintainer-a i tech lider-a.',
    url: 'https://changelog.com/podcast',
    category: 'podcast',
    type: 'besplatno',
    rating: 4.7,
    language: 'en',
    tags: ['Podcast', 'Open Source', 'Developers', 'Tech Leadership'],
    author: 'Changelog Media',
    difficulty: 'intermediate',
    timeToComplete: '60-90 min per episode'
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
    platforms: ['Web', 'Desktop', 'Mobile'],
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
    platforms: ['Web', 'Desktop', 'Mobile'],
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
    platforms: ['Web', 'Desktop', 'Mobile'],
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
    platforms: ['Web', 'Desktop'],
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
    platforms: ['Web', 'Desktop', 'Mobile'],
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
    platforms: ['Web', 'Desktop', 'Mobile'],
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
    platforms: ['Web', 'Desktop'],
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
    platforms: ['Web', 'API'],
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
    platforms: ['Web', 'Desktop', 'Mobile'],
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
    platforms: ['Web', 'Mobile'],
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
  },
  {
    id: '11',
    name: 'GitHub',
    description: 'Najveća platforma za version control i kod kolaboraciju sa 100M+ developer-a.',
    url: 'https://github.com',
    category: 'development',
    pricing: 'freemium',
    rating: 4.9,
    userCount: '100M+ developers',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      'Git version control',
      'Code review and pull requests',
      'Issues and project management',
      'Actions for CI/CD',
      'Copilot AI assistant'
    ],
    pros: [
      'Najveća developer zajednica',
      'Odličan free tier',
      'Integracija sa svim dev tools',
      'GitHub Copilot revolucija'
    ],
    cons: [
      'Može biti overwhelming za početnike',
      'Private repos ograničeni na free planu',
      'Kompleksan za non-tech timove'
    ],
    alternatives: ['GitLab', 'Bitbucket', 'SourceForge'],
    lastUpdated: '2024-01-20'
  },
  {
    id: '12',
    name: 'Asana',
    description: 'Moćan project management tool za timove svih veličina sa naprednim workflow-ima.',
    url: 'https://asana.com',
    category: 'project-management',
    pricing: 'freemium',
    rating: 4.6,
    userCount: '119k+ companies',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      'Task and project management',
      'Timeline and Gantt charts',
      'Custom workflows',
      'Team collaboration',
      'Advanced reporting'
    ],
    pros: [
      'Vrlo intuitivni interface',
      'Fleksibilan workflow',
      'Odlične mobile aplikacije',
      'Strong integration ecosystem'
    ],
    cons: [
      'Može biti overwhelming sa puno opcija',
      'Advanced features na premium planu',
      'Steep learning curve za kompleksne projekte'
    ],
    alternatives: ['Monday.com', 'ClickUp', 'Notion'],
    lastUpdated: '2024-01-18'
  },
  {
    id: '13',
    name: 'Google Drive',
    description: 'Cloud storage i file collaboration platforma integrisana sa Google Workspace.',
    url: 'https://drive.google.com',
    category: 'storage',
    pricing: 'freemium',
    rating: 4.4,
    userCount: '2B+ users',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      '15GB free storage',
      'Real-time collaboration',
      'Docs, Sheets, Slides integration',
      'Advanced sharing controls',
      'Backup and sync'
    ],
    pros: [
      'Excellent collaboration features',
      'Seamless Google integration',
      'Velike storage opcije',
      'Offline access'
    ],
    cons: [
      'Privacy concerns (Google)',
      'Kompleksan permission sistem',
      'Ograničen file versioning'
    ],
    alternatives: ['Dropbox', 'OneDrive', 'iCloud'],
    lastUpdated: '2024-01-16'
  },
  {
    id: '14',
    name: 'Canva',
    description: 'User-friendly design platforma za kreiranje profesionalnih graphics bez dizajnerskog iskustva.',
    url: 'https://canva.com',
    category: 'design',
    pricing: 'freemium',
    rating: 4.8,
    userCount: '135M+ monthly users',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      '610k+ templates',
      'Drag-and-drop editor',
      'Team collaboration',
      'Brand kit management',
      'AI design suggestions'
    ],
    pros: [
      'Izuzetno lako za korišćenje',
      'Ogromna biblioteka template-ova',
      'AI-powered features',
      'Affordable pricing'
    ],
    cons: [
      'Ograničene advanced design opcije',
      'Watermark na free planu',
      'Can be slow sa kompleksnim projektima'
    ],
    alternatives: ['Adobe Creative Cloud', 'Figma', 'Sketch'],
    lastUpdated: '2024-01-14'
  },
  {
    id: '15',
    name: 'HubSpot',
    description: 'All-in-one CRM, marketing, sales i customer service platforma za rast biznisa.',
    url: 'https://hubspot.com',
    category: 'marketing',
    pricing: 'freemium',
    rating: 4.5,
    userCount: '135k+ customers',
    platforms: ['Web', 'Mobile'],
    features: [
      'CRM and contact management',
      'Email marketing automation',
      'Sales pipeline tracking',
      'Landing page builder',
      'Analytics and reporting'
    ],
    pros: [
      'Comprehensive all-in-one solution',
      'Excellent free CRM',
      'Strong integration ecosystem',
      'Great educational content'
    ],
    cons: [
      'Expensive za advanced features',
      'Steep learning curve',
      'Može biti overkill za male biznise'
    ],
    alternatives: ['Salesforce', 'Pipedrive', 'ActiveCampaign'],
    lastUpdated: '2024-01-12'
  },
  {
    id: '16',
    name: 'LastPass',
    description: 'Premium password manager sa naprednim security features za timove i pojedince.',
    url: 'https://lastpass.com',
    category: 'security',
    pricing: 'freemium',
    rating: 4.3,
    userCount: '33M+ users',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      'Password generation and storage',
      'Secure password sharing',
      'Multi-factor authentication',
      'Dark web monitoring',
      'Emergency access'
    ],
    pros: [
      'Military-grade encryption',
      'Cross-platform sync',
      'Team sharing features',
      'Excellent mobile apps'
    ],
    cons: [
      'Security breaches u prošlosti',
      'Free plan very limited',
      'UI može biti confusing'
    ],
    alternatives: ['1Password', 'Bitwarden', 'Dashlane'],
    lastUpdated: '2024-01-10'
  },
  {
    id: '17',
    name: 'Google Analytics',
    description: 'Najpopularniji web analytics tool za praćenje website traffic-a i user behavior.',
    url: 'https://analytics.google.com',
    category: 'analytics',
    pricing: 'besplatno',
    rating: 4.5,
    userCount: '50M+ websites',
    platforms: ['Web'],
    features: [
      'Real-time visitor tracking',
      'Audience segmentation',
      'Conversion tracking',
      'Custom reports',
      'E-commerce analytics'
    ],
    pros: [
      'Completely free',
      'Industry standard',
      'Comprehensive data',
      'Google integration'
    ],
    cons: [
      'Kompleksan za početnike',
      'Privacy concerns',
      'Data sampling na high traffic'
    ],
    alternatives: ['Adobe Analytics', 'Mixpanel', 'Hotjar'],
    lastUpdated: '2024-01-08'
  },
  {
    id: '18',
    name: 'ChatGPT',
    description: 'Revolucionarni AI asistent za pisanje, kodiranje, analizu i kreativni rad.',
    url: 'https://chat.openai.com',
    category: 'ai-tools',
    pricing: 'freemium',
    rating: 4.7,
    userCount: '100M+ users',
    platforms: ['Web', 'Mobile'],
    features: [
      'Advanced text generation',
      'Code writing and debugging',
      'Language translation',
      'Data analysis',
      'Image understanding (GPT-4V)'
    ],
    pros: [
      'Izuzetno versatile',
      'Constantly improving',
      'Great for brainstorming',
      'Saves huge amounts of time'
    ],
    cons: [
      'Can hallucinate facts',
      'Usage limits na free planu',
      'Requires fact-checking'
    ],
    alternatives: ['Claude', 'Gemini', 'Copilot'],
    lastUpdated: '2024-01-22'
  },
  {
    id: '19',
    name: 'Zapier',
    description: 'No-code automation platforma koja povezuje 5000+ aplikacija i automatizuje workflow-e.',
    url: 'https://zapier.com',
    category: 'automation',
    pricing: 'freemium',
    rating: 4.6,
    userCount: '2.2M+ users',
    platforms: ['Web'],
    features: [
      '5000+ app integrations',
      'Multi-step workflows',
      'Conditional logic',
      'Data formatting',
      'Webhook support'
    ],
    pros: [
      'Incredibly powerful automation',
      'No coding required',
      'Huge app ecosystem',
      'Time-saving potential'
    ],
    cons: [
      'Može biti expensive za heavy usage',
      'Learning curve za kompleksne zaps',
      'Sometimes unreliable connections'
    ],
    alternatives: ['Make (Integromat)', 'Microsoft Power Automate', 'IFTTT'],
    lastUpdated: '2024-01-06'
  },
  {
    id: '20',
    name: 'Dropbox',
    description: 'Pionir cloud storage-a sa focus na simplicnost i file synchronization.',
    url: 'https://dropbox.com',
    category: 'storage',
    pricing: 'freemium',
    rating: 4.4,
    userCount: '700M+ registered users',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      '2GB free storage',
      'File synchronization',
      'Version history',
      'Shared folders',
      'Smart sync'
    ],
    pros: [
      'Excellent sync reliability',
      'Simple and intuitive',
      'Cross-platform support',
      'Good collaboration features'
    ],
    cons: [
      'Expensive storage plans',
      'Limited free storage',
      'Fewer features od competitors'
    ],
    alternatives: ['Google Drive', 'OneDrive', 'Box'],
    lastUpdated: '2024-01-04'
  },
  {
    id: '21',
    name: 'Mailchimp',
    description: 'All-in-one marketing platforma sa focus na email marketing i automation.',
    url: 'https://mailchimp.com',
    category: 'marketing',
    pricing: 'freemium',
    rating: 4.3,
    userCount: '12M+ customers',
    platforms: ['Web', 'Mobile'],
    features: [
      'Email campaign builder',
      'Marketing automation',
      'Audience segmentation',
      'A/B testing',
      'Analytics and reporting'
    ],
    pros: [
      'User-friendly drag-and-drop builder',
      'Good free tier',
      'Strong automation features',
      'Comprehensive analytics'
    ],
    cons: [
      'Pricing increases quickly',
      'Limited customization',
      'Customer support može biti slow'
    ],
    alternatives: ['ConvertKit', 'ActiveCampaign', 'AWeber'],
    lastUpdated: '2024-01-02'
  },
  {
    id: '22',
    name: 'Adobe Photoshop',
    description: 'Industry-standard raster graphics editor za photo editing i digital art creation.',
    url: 'https://adobe.com/products/photoshop.html',
    category: 'design',
    pricing: 'placeno',
    rating: 4.7,
    userCount: '22.3M+ subscribers',
    platforms: ['Desktop', 'Mobile'],
    features: [
      'Advanced photo editing',
      'Layer-based editing',
      'AI-powered tools',
      '3D design capabilities',
      'Cloud document sync'
    ],
    pros: [
      'Industry standard',
      'Incredibly powerful',
      'AI features (Neural Filters)',
      'Massive community support'
    ],
    cons: [
      'Expensive subscription model',
      'Steep learning curve',
      'Resource intensive'
    ],
    alternatives: ['GIMP', 'Affinity Photo', 'Canva Pro'],
    lastUpdated: '2024-01-01'
  },
  {
    id: '23',
    name: 'Monday.com',
    description: 'Visual project management platforma sa customizable workflows za timove.',
    url: 'https://monday.com',
    category: 'project-management',
    pricing: 'placeno',
    rating: 4.6,
    userCount: '152k+ customers',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      'Customizable workflows',
      'Timeline and Gantt views',
      'Team collaboration',
      'Automation recipes',
      'Advanced reporting'
    ],
    pros: [
      'Very visual and intuitive',
      'Highly customizable',
      'Great automation features',
      'Excellent customer support'
    ],
    cons: [
      'No free plan',
      'Can be expensive',
      'Overwhelming broj opcija'
    ],
    alternatives: ['Asana', 'ClickUp', 'Smartsheet'],
    lastUpdated: '2023-12-30'
  },
  {
    id: '24',
    name: 'Hotjar',
    description: 'Behavior analytics tool koji pokazuje kako korisnici interaguju sa website-om.',
    url: 'https://hotjar.com',
    category: 'analytics',
    pricing: 'freemium',
    rating: 4.5,
    userCount: '1M+ websites',
    platforms: ['Web'],
    features: [
      'Session recordings',
      'Heatmaps and clickmaps',
      'User feedback polls',
      'Conversion funnels',
      'Form analysis'
    ],
    pros: [
      'Visual insights into user behavior',
      'Easy to set up',
      'Great for UX optimization',
      'Reasonable pricing'
    ],
    cons: [
      'Privacy concerns',
      'Can slow down website',
      'Limited data retention on free plan'
    ],
    alternatives: ['FullStory', 'Crazy Egg', 'LogRocket'],
    lastUpdated: '2023-12-28'
  },
  {
    id: '25',
    name: 'Claude AI',
    description: 'Napredni AI asistent od Anthropic sa focus na safety i helpful konverzacije.',
    url: 'https://claude.ai',
    category: 'ai-tools',
    pricing: 'freemium',
    rating: 4.6,
    userCount: '10M+ users',
    platforms: ['Web'],
    features: [
      'Advanced reasoning',
      'Long context understanding',
      'Code generation',
      'Document analysis',
      'Ethical AI responses'
    ],
    pros: [
      'Very thoughtful responses',
      'Great at complex reasoning',
      'Strong ethical guidelines',
      'Handles long documents well'
    ],
    cons: [
      'Newer od ChatGPT',
      'Limited availability',
      'Fewer integrations'
    ],
    alternatives: ['ChatGPT', 'Gemini', 'Perplexity'],
    lastUpdated: '2024-01-25'
  },
  {
    id: '26',
    name: 'Grammarly',
    description: 'AI writing assistant za poboljšanje pisanja, proveru gramatike i stilske sugestije.',
    url: 'https://grammarly.com',
    category: 'ai-tools',
    pricing: 'freemium',
    rating: 4.5,
    userCount: '30M+ users',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      'Grammar and spell checking',
      'Style and tone suggestions',
      'Plagiarism detection',
      'Writing goals tracking',
      'Browser extensions'
    ],
    pros: [
      'Dramatically improves writing quality',
      'Real-time suggestions',
      'Works across platforms',
      'Multiple writing styles'
    ],
    cons: [
      'Premium features expensive',
      'Sometimes overly aggressive suggestions',
      'Privacy concerns sa tekstom'
    ],
    alternatives: ['ProWritingAid', 'Hemingway Editor', 'LanguageTool'],
    lastUpdated: '2024-01-20'
  },
  {
    id: '27',
    name: 'Miro',
    description: 'Online collaborative whiteboard platform za visual collaboration i brainstorming.',
    url: 'https://miro.com',
    category: 'design',
    pricing: 'freemium',
    rating: 4.7,
    userCount: '35M+ users',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      'Infinite collaborative canvas',
      'Templates for various workflows',
      'Real-time collaboration',
      'Sticky notes and mind maps',
      'Integration with 100+ apps'
    ],
    pros: [
      'Excellent for visual thinking',
      'Great template library',
      'Real-time collaboration features',
      'Intuitive interface'
    ],
    cons: [
      'Can be overwhelming za početnike',
      'Premium features limited on free plan',
      'Performance issues sa large boards'
    ],
    alternatives: ['Mural', 'Conceptboard', 'Lucidchart'],
    lastUpdated: '2024-01-18'
  },
  {
    id: '28',
    name: 'Linear',
    description: 'Modern issue tracking tool built for high-performance software teams.',
    url: 'https://linear.app',
    category: 'project-management',
    pricing: 'freemium',
    rating: 4.8,
    userCount: '10k+ teams',
    platforms: ['Web', 'Desktop', 'Mobile'],
    features: [
      'Lightning-fast interface',
      'Git integration',
      'Automated workflows',
      'Roadmap planning',
      'Team performance insights'
    ],
    pros: [
      'Incredibly fast and responsive',
      'Beautiful, modern design',
      'Great keyboard shortcuts',
      'Excellent developer experience'
    ],
    cons: [
      'Still relatively new',
      'Limited customization options',
      'May be overkill za simple projects'
    ],
    alternatives: ['Jira', 'GitHub Issues', 'Asana'],
    lastUpdated: '2024-01-15'
  },
  {
    id: '29',
    name: 'Obsidian',
    description: 'Powerful knowledge base that works on top of local folder with plain text Markdown files.',
    url: 'https://obsidian.md',
    category: 'produktivnost',
    pricing: 'freemium',
    rating: 4.6,
    userCount: '1M+ users',
    platforms: ['Desktop', 'Mobile'],
    features: [
      'Linked thought process',
      'Graph view of connections',
      'Extensive plugin ecosystem',
      'Local storage first',
      'Markdown-based notes'
    ],
    pros: [
      'Complete ownership of data',
      'Highly customizable',
      'Strong community and plugins',
      'No vendor lock-in'
    ],
    cons: [
      'Steep learning curve',
      'Overwhelming broj opcija',
      'Requires local storage management'
    ],
    alternatives: ['Notion', 'Roam Research', 'RemNote'],
    lastUpdated: '2024-01-12'
  },
  {
    id: '30',
    name: 'Vercel',
    description: 'Frontend cloud platform za deployment i hosting Next.js aplikacija i static sites.',
    url: 'https://vercel.com',
    category: 'development',
    pricing: 'freemium',
    rating: 4.8,
    userCount: '500k+ developers',
    platforms: ['Web', 'CLI'],
    features: [
      'Zero-config deployments',
      'Global Edge Network',
      'Preview deployments',
      'Serverless functions',
      'Analytics and monitoring'
    ],
    pros: [
      'Incredibly easy deployment',
      'Excellent Next.js integration',
      'Lightning-fast global CDN',
      'Great developer experience'
    ],
    cons: [
      'Pricing can get expensive',
      'Limited backend capabilities',
      'Vendor lock-in concerns'
    ],
    alternatives: ['Netlify', 'Cloudflare Pages', 'AWS Amplify'],
    lastUpdated: '2024-01-10'
  }
]
