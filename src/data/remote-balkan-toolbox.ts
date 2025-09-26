import { ToolboxLink, FeatureModule } from '@/types/toolbox';

// Complete Remote Balkan Toolbox with 140+ curated links
export const remoteBalkanToolbox: ToolboxLink[] = [
  // Job Boards - Global
  {
    id: 'remote-ok',
    category: 'Job Boards - Global',
    name: 'Remote OK',
    type: 'Jobs board',
    use: 'Global remote jobs',
    url: 'https://remoteok.com/',
    tags: ['remote', 'global', 'tech'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'we-work-remotely',
    category: 'Job Boards - Global',
    name: 'We Work Remotely',
    type: 'Jobs board',
    use: 'Large remote-only board',
    url: 'https://weworkremotely.com/',
    tags: ['remote', 'global', 'large'],
    rating: 4.7,
    isFeatured: true
  },
  {
    id: 'remotive',
    category: 'Job Boards - Global',
    name: 'Remotive',
    type: 'Jobs board',
    use: 'Curated remote jobs & community',
    url: 'https://remotive.com/',
    tags: ['remote', 'curated', 'community'],
    rating: 4.6
  },
  {
    id: 'eu-remote-jobs',
    category: 'Job Boards - Global',
    name: 'EU Remote Jobs',
    type: 'Jobs board',
    use: 'Remote roles focused on EU timezones',
    url: 'https://euremotejobs.com/',
    tags: ['remote', 'eu', 'timezone'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'remote-europe',
    category: 'Job Boards - Global',
    name: 'Remote Europe',
    type: 'Jobs board',
    use: 'Remote roles in Europe',
    url: 'https://remote-europe.com/',
    tags: ['remote', 'europe'],
    rating: 4.4
  },
  {
    id: 'daily-remote',
    category: 'Job Boards - Global',
    name: 'DailyRemote',
    type: 'Jobs board',
    use: 'Daily aggregated remote postings',
    url: 'https://dailyremote.com/',
    tags: ['remote', 'daily', 'aggregator'],
    rating: 4.3
  },
  {
    id: 'working-nomads',
    category: 'Job Boards - Global',
    name: 'Working Nomads',
    type: 'Jobs board',
    use: 'Aggregated remote jobs',
    url: 'https://www.workingnomads.com/jobs',
    tags: ['remote', 'nomad', 'aggregator'],
    rating: 4.2
  },
  {
    id: 'flexjobs',
    category: 'Job Boards - Global',
    name: 'FlexJobs',
    type: 'Jobs board (paid)',
    use: 'Vetted remote & flexible jobs',
    url: 'https://www.flexjobs.com/',
    tags: ['remote', 'vetted', 'paid', 'flexible'],
    rating: 4.5
  },
  {
    id: 'hn-jobs',
    category: 'Job Boards - Global',
    name: 'Hacker News Jobs',
    type: 'Jobs board',
    use: 'Tech jobs (often remote)',
    url: 'https://news.ycombinator.com/jobs',
    tags: ['tech', 'startup', 'hn'],
    rating: 4.1
  },
  {
    id: 'linkedin-jobs',
    category: 'Job Boards - Global',
    name: 'LinkedIn Jobs (Remote filter)',
    type: 'Jobs board',
    use: 'Use remote/Europe filters',
    url: 'https://www.linkedin.com/jobs/',
    tags: ['linkedin', 'professional', 'network'],
    rating: 4.0
  },

  // Job Boards - Balkans
  {
    id: 'poslovi-infostud',
    category: 'Job Boards - Balkans',
    name: 'Poslovi Infostud',
    type: 'Local jobs',
    use: 'SR portal – filter \'remote/rad na daljinu\'',
    url: 'https://poslovi.infostud.com/',
    tags: ['serbia', 'local', 'remote'],
    rating: 4.3,
    isLocal: true,
    isFeatured: true
  },
  {
    id: 'helloworld-rs',
    category: 'Job Boards - Balkans',
    name: 'HelloWorld.rs',
    type: 'Local IT jobs',
    use: 'SR IT portal – remote filter',
    url: 'https://www.helloworld.rs/poslovi',
    tags: ['serbia', 'it', 'tech'],
    rating: 4.4,
    isLocal: true,
    isFeatured: true
  },
  {
    id: 'it-poslovi-startit',
    category: 'Job Boards - Balkans',
    name: 'IT Poslovi (Startit)',
    type: 'Local IT jobs',
    use: 'SR community job board',
    url: 'https://startit.rs/poslovi/',
    tags: ['serbia', 'it', 'community'],
    rating: 4.2,
    isLocal: true
  },
  {
    id: 'mojposao-hr',
    category: 'Job Boards - Balkans',
    name: 'MojPosao (HR)',
    type: 'Local jobs',
    use: 'Croatia jobs – remote filter',
    url: 'https://www.moj-posao.net/',
    tags: ['croatia', 'local'],
    rating: 4.0,
    isLocal: true
  },

  // Payroll & EOR
  {
    id: 'deel',
    category: 'Payroll & EOR',
    name: 'Deel',
    type: 'EOR/Payroll',
    use: 'Hire & pay globally (contractors/EOR)',
    url: 'https://www.deel.com/',
    tags: ['eor', 'payroll', 'global', 'contractors'],
    rating: 4.7,
    isFeatured: true
  },
  {
    id: 'remote-com',
    category: 'Payroll & EOR',
    name: 'Remote.com',
    type: 'EOR/Payroll',
    use: 'Employer of Record & contractor pay',
    url: 'https://remote.com/',
    tags: ['eor', 'payroll', 'global'],
    rating: 4.6,
    isFeatured: true
  },
  {
    id: 'oysterhr',
    category: 'Payroll & EOR',
    name: 'OysterHR',
    type: 'EOR/Payroll',
    use: 'Global hiring & payroll',
    url: 'https://oysterhr.com/',
    tags: ['eor', 'hr', 'global'],
    rating: 4.5
  },

  // Payments/Banking
  {
    id: 'wise',
    category: 'Payments/Banking',
    name: 'Wise',
    type: 'Fintech',
    use: 'Multi-currency accounts & transfers',
    url: 'https://wise.com/',
    tags: ['fintech', 'multi-currency', 'transfers'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'payoneer',
    category: 'Payments/Banking',
    name: 'Payoneer',
    type: 'Fintech',
    use: 'Receive client payments globally',
    url: 'https://www.payoneer.com/',
    tags: ['fintech', 'payments', 'global'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'revolut-business',
    category: 'Payments/Banking',
    name: 'Revolut Business',
    type: 'Fintech',
    use: 'Business accounts & cards',
    url: 'https://www.revolut.com/business/',
    tags: ['fintech', 'business', 'cards'],
    rating: 4.4
  },

  // Legal/Tax/Gov – Serbia
  {
    id: 'poreska-uprava',
    category: 'Legal/Tax/Gov - RS',
    name: 'Poreska uprava Srbije (PU)',
    type: 'Gov',
    use: 'Poreska pravila, paušal, doprinosi',
    url: 'https://www.purs.gov.rs/',
    tags: ['serbia', 'tax', 'government', 'pausal'],
    rating: 4.0,
    isLocal: true,
    isFeatured: true
  },
  {
    id: 'apr-registracija',
    category: 'Legal/Tax/Gov - RS',
    name: 'APR – Registracija preduzetnika/doo',
    type: 'Gov',
    use: 'Agencija za privredne registre',
    url: 'https://www.apr.gov.rs/',
    tags: ['serbia', 'registration', 'business'],
    rating: 4.1,
    isLocal: true
  },
  {
    id: 'efaktura',
    category: 'Legal/Tax/Gov - RS',
    name: 'eFaktura',
    type: 'Gov',
    use: 'Sistemska e-faktura (B2G/B2B)',
    url: 'https://efaktura.gov.rs/',
    tags: ['serbia', 'invoice', 'b2b'],
    rating: 3.8,
    isLocal: true
  },

  // Security/Privacy
  {
    id: 'mullvad-vpn',
    category: 'Security/Privacy',
    name: 'Mullvad VPN',
    type: 'VPN',
    use: 'Bez logova, WireGuard',
    url: 'https://mullvad.net/',
    tags: ['vpn', 'privacy', 'wireguard'],
    rating: 4.9
  },
  {
    id: '1password',
    category: 'Security/Privacy',
    name: '1Password',
    type: 'Password manager',
    use: 'Lozinke, šifre, šaring',
    url: 'https://1password.com/',
    tags: ['password', 'security', 'vault'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'bitwarden',
    category: 'Security/Privacy',
    name: 'Bitwarden',
    type: 'Password manager',
    use: 'Open-source menadžer lozinki',
    url: 'https://bitwarden.com/',
    tags: ['password', 'open-source', 'security'],
    rating: 4.7,
    isFeatured: true
  },

  // Communication/Collaboration
  {
    id: 'slack',
    category: 'Communication/Collab',
    name: 'Slack',
    type: 'Chat',
    use: 'Tim komunikacija',
    url: 'https://slack.com/',
    tags: ['chat', 'team', 'collaboration'],
    rating: 4.6
  },
  {
    id: 'calendly',
    category: 'Communication/Collab',
    name: 'Calendly',
    type: 'Scheduling',
    use: 'Zakazivanje sastanaka',
    url: 'https://calendly.com/',
    tags: ['scheduling', 'meetings', 'calendar'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'cal-com',
    category: 'Communication/Collab',
    name: 'Cal.com',
    type: 'Scheduling',
    use: 'Open-source zakazivanje',
    url: 'https://cal.com/',
    tags: ['scheduling', 'open-source', 'meetings'],
    rating: 4.4,
    isFeatured: true
  },

  // Time Tracking
  {
    id: 'clockify',
    category: 'Time Tracking/Focus',
    name: 'Clockify',
    type: 'Time tracking',
    use: 'SR tim, praćenje vremena',
    url: 'https://clockify.me/',
    tags: ['time-tracking', 'serbian', 'team'],
    rating: 4.6,
    isLocal: true,
    isFeatured: true
  },
  {
    id: 'toggl',
    category: 'Time Tracking/Focus',
    name: 'Toggl Track',
    type: 'Time tracking',
    use: 'Praćenje vremena',
    url: 'https://toggl.com/track/',
    tags: ['time-tracking', 'productivity'],
    rating: 4.5
  },

  // Cloud/Dev/Deploy
  {
    id: 'vercel',
    category: 'Cloud/Dev/Deploy',
    name: 'Vercel',
    type: 'Hosting',
    use: 'Frontend/SSR hosting',
    url: 'https://vercel.com/',
    tags: ['hosting', 'frontend', 'nextjs'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'railway',
    category: 'Cloud/Dev/Deploy',
    name: 'Railway',
    type: 'Hosting',
    use: 'Back-end & DB deploy',
    url: 'https://railway.com/',
    tags: ['hosting', 'backend', 'database'],
    rating: 4.7,
    isFeatured: true
  },

  // Salary & Cost of Living
  {
    id: 'levels-fyi',
    category: 'Salary & Cost',
    name: 'Levels.fyi',
    type: 'Salaries',
    use: 'Plate u IT/tech',
    url: 'https://www.levels.fyi/',
    tags: ['salary', 'tech', 'levels'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'numbeo',
    category: 'Salary & Cost',
    name: 'Numbeo',
    type: 'Cost of living',
    use: 'Troškovi života po gradovima',
    url: 'https://www.numbeo.com/cost-of-living/',
    tags: ['cost-of-living', 'cities', 'comparison'],
    rating: 4.5,
    isFeatured: true
  },

  // Coworking/Nomad
  {
    id: 'nomad-list',
    category: 'Coworking/Nomad',
    name: 'Nomad List',
    type: 'Community',
    use: 'Gradovi, internet, troškovi',
    url: 'https://nomadlist.com/',
    tags: ['nomad', 'community', 'cities'],
    rating: 4.7,
    isFeatured: true
  },

  // Job Boards - Global (Extended)
  {
    id: 'angelist-wellfound',
    category: 'Job Boards - Global',
    name: 'AngelList Talent (Wellfound)',
    type: 'Jobs board',
    use: 'Startup jobs, many remote',
    url: 'https://wellfound.com/',
    tags: ['startup', 'remote', 'equity'],
    rating: 4.4
  },
  {
    id: 'js-remotely',
    category: 'Job Boards - Global',
    name: 'JS Remotely',
    type: 'Jobs board',
    use: 'JS/Frontend remote roles',
    url: 'https://jsremotely.com/',
    tags: ['javascript', 'frontend', 'remote'],
    rating: 4.2
  },
  {
    id: 'python-jobs-remotely',
    category: 'Job Boards - Global',
    name: 'Python Jobs Remotely',
    type: 'Jobs board',
    use: 'Python remote roles',
    url: 'https://pythonremotely.com/',
    tags: ['python', 'backend', 'remote'],
    rating: 4.3
  },

  // Job Boards - Balkans (Extended)
  {
    id: 'posao-hr',
    category: 'Job Boards - Balkans',
    name: 'Posao.hr (HR)',
    type: 'Local jobs',
    use: 'Croatia jobs – remote filter',
    url: 'https://www.posao.hr/',
    tags: ['croatia', 'local', 'remote'],
    rating: 3.9,
    isLocal: true
  },
  {
    id: 'posao-ba',
    category: 'Job Boards - Balkans',
    name: 'Posao.ba (BA)',
    type: 'Local jobs',
    use: 'Bosnia & Herzegovina jobs',
    url: 'https://www.posao.ba/',
    tags: ['bosnia', 'local'],
    rating: 3.8,
    isLocal: true
  },
  {
    id: 'bestjobs-eu',
    category: 'Job Boards - Balkans',
    name: 'BestJobs.eu (RO/BG/SEE)',
    type: 'Regional jobs',
    use: 'SEE jobs incl. remote',
    url: 'https://www.bestjobs.eu/',
    tags: ['romania', 'bulgaria', 'see', 'remote'],
    rating: 4.0,
    isLocal: true
  },

  // Freelance Marketplaces
  {
    id: 'upwork',
    category: 'Freelance Marketplaces',
    name: 'Upwork',
    type: 'Marketplace',
    use: 'Global freelance marketplace',
    url: 'https://www.upwork.com/',
    tags: ['freelance', 'marketplace', 'global'],
    rating: 4.2,
    isFeatured: true
  },
  {
    id: 'fiverr',
    category: 'Freelance Marketplaces',
    name: 'Fiverr',
    type: 'Marketplace',
    use: 'Global freelance marketplace',
    url: 'https://www.fiverr.com/',
    tags: ['freelance', 'services', 'gig'],
    rating: 4.0
  },
  {
    id: 'toptal',
    category: 'Freelance Marketplaces',
    name: 'Toptal',
    type: 'Marketplace',
    use: 'Vetted top 3% talent network',
    url: 'https://www.toptal.com/',
    tags: ['freelance', 'elite', 'vetted'],
    rating: 4.6,
    isFeatured: true
  },
  {
    id: 'contra',
    category: 'Freelance Marketplaces',
    name: 'Contra',
    type: 'Marketplace',
    use: 'Commission-free freelance marketplace',
    url: 'https://contra.com/',
    tags: ['freelance', 'commission-free', 'modern'],
    rating: 4.3
  },

  // Payroll & EOR (Extended)
  {
    id: 'papaya-global',
    category: 'Payroll & EOR',
    name: 'Papaya Global',
    type: 'EOR/Payroll',
    use: 'Global payroll & EOR',
    url: 'https://www.papayaglobal.com/',
    tags: ['eor', 'payroll', 'global'],
    rating: 4.4
  },
  {
    id: 'rippling',
    category: 'Payroll & EOR',
    name: 'Rippling',
    type: 'EOR/HRIS',
    use: 'Global HR, payroll, IT',
    url: 'https://www.rippling.com/',
    tags: ['hris', 'payroll', 'it'],
    rating: 4.5
  },

  // Payments/Banking (Extended)
  {
    id: 'paddle',
    category: 'Payments/Banking',
    name: 'Paddle',
    type: 'Payments',
    use: 'Merchant of record for SaaS',
    url: 'https://www.paddle.com/',
    tags: ['mor', 'saas', 'payments'],
    rating: 4.4,
    isFeatured: true
  },
  {
    id: 'lemon-squeezy',
    category: 'Payments/Banking',
    name: 'Lemon Squeezy',
    type: 'Payments',
    use: 'Merchant of record for SaaS/digital',
    url: 'https://www.lemonsqueezy.com/',
    tags: ['mor', 'saas', 'digital'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'nbs-kurs',
    category: 'Payments/Banking',
    name: 'NBS Kursna Lista',
    type: 'FX Rates',
    use: 'National Bank of Serbia daily rates',
    url: 'https://www.nbs.rs/',
    tags: ['serbia', 'fx', 'rates'],
    rating: 4.0,
    isLocal: true
  },

  // Invoicing & Accounting
  {
    id: 'invoice-ninja',
    category: 'Invoicing & Accounting',
    name: 'Invoice Ninja',
    type: 'Invoicing (open-source)',
    use: 'Self-hosted/cloud invoicing',
    url: 'https://invoiceninja.com/',
    tags: ['invoicing', 'open-source', 'self-hosted'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'zoho-invoice',
    category: 'Invoicing & Accounting',
    name: 'Zoho Invoice',
    type: 'Invoicing',
    use: 'Free invoicing for small businesses',
    url: 'https://www.zoho.com/invoice/',
    tags: ['invoicing', 'free', 'small-business'],
    rating: 4.3
  },
  {
    id: 'xero',
    category: 'Invoicing & Accounting',
    name: 'Xero',
    type: 'Accounting',
    use: 'Cloud accounting',
    url: 'https://www.xero.com/',
    tags: ['accounting', 'cloud', 'comprehensive'],
    rating: 4.4
  },

  // Legal/Tax/Gov - HR
  {
    id: 'mup-digital-nomad',
    category: 'Legal/Tax/Gov - HR',
    name: 'MUP – Digital Nomad (Croatia)',
    type: 'Gov',
    use: 'Privremeni boravak za digitalne nomade',
    url: 'https://mup.gov.hr/',
    tags: ['croatia', 'digital-nomad', 'visa'],
    rating: 4.2,
    isLocal: true
  },

  // Legal/Tax/Gov - EU
  {
    id: 'eu-gdpr',
    category: 'Legal/Tax/Gov - EU',
    name: 'EU GDPR (European Commission)',
    type: 'Gov',
    use: 'EU pravila zaštite podataka',
    url: 'https://commission.europa.eu/law/law-topic/data-protection/eu-data-protection-rules_en',
    tags: ['eu', 'gdpr', 'privacy'],
    rating: 4.0
  },

  // Contracts / E-sign
  {
    id: 'onenda',
    category: 'Contracts / E-sign',
    name: 'oneNDA',
    type: 'Legal template',
    use: 'Open-source standardni NDA',
    url: 'https://onenda.org/',
    tags: ['nda', 'open-source', 'legal'],
    rating: 4.3,
    isFeatured: true
  },
  {
    id: 'docusign',
    category: 'Contracts / E-sign',
    name: 'DocuSign',
    type: 'E-sign',
    use: 'Elektronsko potpisivanje',
    url: 'https://www.docusign.com/',
    tags: ['e-sign', 'contracts', 'digital'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'dropbox-sign',
    category: 'Contracts / E-sign',
    name: 'Dropbox Sign (HelloSign)',
    type: 'E-sign',
    use: 'Elektronsko potpisivanje',
    url: 'https://www.dropbox.com/sign',
    tags: ['e-sign', 'dropbox', 'simple'],
    rating: 4.4
  },

  // Coworking/Nomad (Extended)
  {
    id: 'coworker',
    category: 'Coworking/Nomad',
    name: 'Coworker',
    type: 'Directory',
    use: 'Pronađi coworking prostore',
    url: 'https://www.coworker.com/',
    tags: ['coworking', 'directory', 'spaces'],
    rating: 4.3
  },
  {
    id: 'workfrom',
    category: 'Coworking/Nomad',
    name: 'Workfrom',
    type: 'Directory',
    use: 'Kafici & prostori za rad',
    url: 'https://workfrom.co/',
    tags: ['cafe', 'workspace', 'remote'],
    rating: 4.1
  },
  {
    id: 'belgrade-coworking',
    category: 'Coworking/Nomad',
    name: 'BelgradeGets.Digital – Coworking',
    type: 'Guide',
    use: 'Lista coworking prostora BG',
    url: 'https://belgradegets.digital/work/coworking-spaces/',
    tags: ['belgrade', 'coworking', 'local'],
    rating: 4.0,
    isLocal: true
  },

  // Internet/ISP - Serbia
  {
    id: 'mts',
    category: 'Internet/ISP - RS',
    name: 'Telekom Srbija (mts)',
    type: 'ISP',
    use: 'Optički internet paketi',
    url: 'https://mts.rs/',
    tags: ['serbia', 'isp', 'fiber'],
    rating: 4.1,
    isLocal: true,
    isFeatured: true
  },
  {
    id: 'sbb',
    category: 'Internet/ISP - RS',
    name: 'SBB',
    type: 'ISP',
    use: 'Kablovski i optički internet',
    url: 'https://www.sbb.rs/',
    tags: ['serbia', 'isp', 'cable'],
    rating: 4.0,
    isLocal: true,
    isFeatured: true
  },
  {
    id: 'a1-srbija',
    category: 'Internet/ISP - RS',
    name: 'A1 Srbija',
    type: 'ISP/Mobile',
    use: 'Fiksni i mobilni internet',
    url: 'https://www.a1.rs/',
    tags: ['serbia', 'isp', 'mobile'],
    rating: 3.9,
    isLocal: true
  },
  {
    id: 'yettel',
    category: 'Internet/ISP - RS',
    name: 'Yettel Srbija',
    type: 'Mobile',
    use: 'Mobilni internet',
    url: 'https://www.yettel.rs/',
    tags: ['serbia', 'mobile', 'lte'],
    rating: 3.8,
    isLocal: true
  },
  {
    id: 'starlink',
    category: 'Internet/ISP - RS',
    name: 'Starlink Availability',
    type: 'Satellite',
    use: 'Satelitski internet dostupnost',
    url: 'https://www.starlink.com/map',
    tags: ['satellite', 'internet', 'backup'],
    rating: 4.3
  },

  // Security/Privacy (Extended)
  {
    id: 'proton-vpn',
    category: 'Security/Privacy',
    name: 'Proton VPN',
    type: 'VPN',
    use: 'VPN + Proton ekosistem',
    url: 'https://protonvpn.com/',
    tags: ['vpn', 'privacy', 'proton'],
    rating: 4.7
  },
  {
    id: 'yubikey',
    category: 'Security/Privacy',
    name: 'YubiKey (Yubico)',
    type: '2FA key',
    use: 'Hardverska 2FA/Passkeys',
    url: 'https://www.yubico.com/',
    tags: ['2fa', 'hardware', 'security'],
    rating: 4.9,
    isFeatured: true
  },
  {
    id: 'signal',
    category: 'Security/Privacy',
    name: 'Signal',
    type: 'Messaging',
    use: 'End-to-end šifrovane poruke',
    url: 'https://signal.org/',
    tags: ['messaging', 'encryption', 'privacy'],
    rating: 4.8
  },
  {
    id: 'proton-mail',
    category: 'Security/Privacy',
    name: 'Proton Mail',
    type: 'Email',
    use: 'Šifrovan email',
    url: 'https://proton.me/mail',
    tags: ['email', 'encryption', 'privacy'],
    rating: 4.6
  },

  // Communication/Collab (Extended)
  {
    id: 'teams',
    category: 'Communication/Collab',
    name: 'Microsoft Teams',
    type: 'Chat/Meetings',
    use: 'Komunikacija i sastanci',
    url: 'https://www.microsoft.com/en/microsoft-teams/group-chat-software',
    tags: ['chat', 'meetings', 'microsoft'],
    rating: 4.3
  },
  {
    id: 'zoom',
    category: 'Communication/Collab',
    name: 'Zoom',
    type: 'Meetings',
    use: 'Video sastanci',
    url: 'https://zoom.us/',
    tags: ['meetings', 'video', 'webinar'],
    rating: 4.4
  },
  {
    id: 'loom',
    category: 'Communication/Collab',
    name: 'Loom',
    type: 'Async video',
    use: 'Video snimci za async rad',
    url: 'https://www.loom.com/',
    tags: ['async', 'video', 'recording'],
    rating: 4.6,
    isFeatured: true
  },
  {
    id: 'krisp',
    category: 'Communication/Collab',
    name: 'Krisp.ai',
    type: 'Noise canceling',
    use: 'Uklanjanje buke na pozivima',
    url: 'https://krisp.ai/',
    tags: ['noise-cancel', 'ai', 'calls'],
    rating: 4.7,
    isFeatured: true
  },
  {
    id: 'worldtimebuddy',
    category: 'Communication/Collab',
    name: 'WorldTimeBuddy',
    type: 'Timezones',
    use: 'Koordinacija vremenskih zona',
    url: 'https://www.worldtimebuddy.com/',
    tags: ['timezone', 'coordination', 'meetings'],
    rating: 4.4
  },

  // Productivity/PM
  {
    id: 'notion',
    category: 'Productivity/PM',
    name: 'Notion',
    type: 'Docs/PM/DB',
    use: 'Sve-u-jednom radni prostor',
    url: 'https://www.notion.com/',
    tags: ['docs', 'pm', 'database'],
    rating: 4.7,
    isFeatured: true
  },
  {
    id: 'linear',
    category: 'Productivity/PM',
    name: 'Linear',
    type: 'Product/Issues',
    use: 'Planiranje i praćenje rada',
    url: 'https://linear.app/',
    tags: ['product', 'issues', 'planning'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'trello',
    category: 'Productivity/PM',
    name: 'Trello',
    type: 'PM',
    use: 'Kanban zadaci',
    url: 'https://trello.com/',
    tags: ['kanban', 'tasks', 'simple'],
    rating: 4.2
  },
  {
    id: 'obsidian',
    category: 'Productivity/PM',
    name: 'Obsidian',
    type: 'Notes',
    use: 'Lokalne povezane beleške',
    url: 'https://obsidian.md/',
    tags: ['notes', 'local', 'linked'],
    rating: 4.6
  },

  // Time Tracking/Focus (Extended)
  {
    id: 'harvest',
    category: 'Time Tracking/Focus',
    name: 'Harvest',
    type: 'Time tracking',
    use: 'Vreme + fakturisanje',
    url: 'https://www.harvestapp.com/',
    tags: ['time-tracking', 'invoicing', 'billing'],
    rating: 4.4
  },
  {
    id: 'rescuetime',
    category: 'Time Tracking/Focus',
    name: 'RescueTime',
    type: 'Focus',
    use: 'Analiza produktivnosti',
    url: 'https://www.rescuetime.com/',
    tags: ['productivity', 'analysis', 'focus'],
    rating: 4.1
  },
  {
    id: 'forest',
    category: 'Time Tracking/Focus',
    name: 'Forest',
    type: 'Focus',
    use: 'Pomodoro fokus app',
    url: 'https://www.forestapp.cc/',
    tags: ['pomodoro', 'focus', 'gamification'],
    rating: 4.3
  },

  // Cloud/Dev/Deploy (Extended)
  {
    id: 'github',
    category: 'Cloud/Dev/Deploy',
    name: 'GitHub',
    type: 'Code hosting',
    use: 'Repozitorijumi i CI',
    url: 'https://github.com/',
    tags: ['git', 'ci', 'code-hosting'],
    rating: 4.8,
    isFeatured: true
  },
  {
    id: 'render',
    category: 'Cloud/Dev/Deploy',
    name: 'Render',
    type: 'Hosting',
    use: 'Web services & DB',
    url: 'https://render.com/',
    tags: ['hosting', 'database', 'services'],
    rating: 4.6
  },
  {
    id: 'supabase',
    category: 'Cloud/Dev/Deploy',
    name: 'Supabase',
    type: 'BaaS',
    use: 'Postgres + Auth + Storage',
    url: 'https://supabase.com/',
    tags: ['baas', 'postgres', 'auth'],
    rating: 4.7,
    isFeatured: true
  },
  {
    id: 'firebase',
    category: 'Cloud/Dev/Deploy',
    name: 'Firebase',
    type: 'BaaS',
    use: 'Realtime DB/Auth/Hosting',
    url: 'https://firebase.google.com/',
    tags: ['baas', 'realtime', 'google'],
    rating: 4.5
  },

  // Monitoring/Logs
  {
    id: 'sentry',
    category: 'Monitoring/Logs',
    name: 'Sentry',
    type: 'Monitoring',
    use: 'Error & performance monitoring',
    url: 'https://sentry.io/',
    tags: ['monitoring', 'errors', 'performance'],
    rating: 4.7,
    isFeatured: true
  },
  {
    id: 'better-stack',
    category: 'Monitoring/Logs',
    name: 'Better Stack (Logtail)',
    type: 'Logs/Monitoring',
    use: 'Logovi, uptime, incidenti',
    url: 'https://betterstack.com/',
    tags: ['logs', 'uptime', 'incidents'],
    rating: 4.4
  },

  // Storage/Files
  {
    id: 'google-drive',
    category: 'Storage/Files',
    name: 'Google Drive',
    type: 'Storage',
    use: 'Fajlovi i deljenje',
    url: 'https://drive.google.com/',
    tags: ['storage', 'sharing', 'google'],
    rating: 4.4
  },
  {
    id: 'dropbox',
    category: 'Storage/Files',
    name: 'Dropbox',
    type: 'Storage',
    use: 'Fajlovi i timovi',
    url: 'https://www.dropbox.com/',
    tags: ['storage', 'sync', 'teams'],
    rating: 4.3
  },
  {
    id: 'pcloud',
    category: 'Storage/Files',
    name: 'pCloud',
    type: 'Storage',
    use: 'EU-hosted cloud (CH/EU)',
    url: 'https://www.pcloud.com/',
    tags: ['storage', 'eu', 'privacy'],
    rating: 4.2
  },

  // Salary & Cost (Extended)
  {
    id: 'glassdoor',
    category: 'Salary & Cost',
    name: 'Glassdoor',
    type: 'Salaries',
    use: 'Plate po kompaniji/poziciji',
    url: 'https://www.glassdoor.com/Salaries/index.htm',
    tags: ['salaries', 'companies', 'reviews'],
    rating: 4.3
  },
  {
    id: 'expatistan',
    category: 'Salary & Cost',
    name: 'Expatistan',
    type: 'Cost of living',
    use: 'Uporedi troškove gradova',
    url: 'https://www.expatistan.com/cost-of-living',
    tags: ['cost-of-living', 'comparison', 'expat'],
    rating: 4.2
  },

  // Insurance
  {
    id: 'safetywing',
    category: 'Insurance',
    name: 'SafetyWing',
    type: 'Insurance',
    use: 'Zdravstveno za remote timove/nomade',
    url: 'https://safetywing.com/',
    tags: ['insurance', 'health', 'nomad'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'world-nomads',
    category: 'Insurance',
    name: 'World Nomads',
    type: 'Insurance',
    use: 'Putno osiguranje',
    url: 'https://www.worldnomads.com/',
    tags: ['insurance', 'travel', 'nomad'],
    rating: 4.3
  },

  // Localization
  {
    id: 'crowdin',
    category: 'Localization',
    name: 'Crowdin',
    type: 'Localization',
    use: 'TMS & automatski prevodi',
    url: 'https://crowdin.com/',
    tags: ['localization', 'translation', 'automation'],
    rating: 4.5,
    isFeatured: true
  },
  {
    id: 'lokalise',
    category: 'Localization',
    name: 'Lokalise',
    type: 'Localization',
    use: 'TMS & OTA za app/web',
    url: 'https://lokalise.com/',
    tags: ['localization', 'ota', 'mobile'],
    rating: 4.4
  },
  {
    id: 'deepl',
    category: 'Localization',
    name: 'DeepL',
    type: 'Translation',
    use: 'AI prevod',
    url: 'https://www.deepl.com/',
    tags: ['translation', 'ai', 'quality'],
    rating: 4.8,
    isFeatured: true
  },

  // Job Data/APIs (Extended)
  {
    id: 'jooble-api',
    category: 'Job Data/APIs',
    name: 'Jooble API',
    type: 'API',
    use: 'REST API za poslove',
    url: 'https://jooble.org/api/about',
    tags: ['api', 'jobs', 'rest'],
    rating: 4.1
  },
  {
    id: 'greenhouse-api',
    category: 'Job Data/APIs',
    name: 'Greenhouse Job Board API',
    type: 'API',
    use: 'API za kompanijske oglase',
    url: 'https://developers.greenhouse.io/job-board.html',
    tags: ['api', 'ats', 'greenhouse'],
    rating: 4.0
  },

  // Community/Learning - Regional
  {
    id: 'startit',
    category: 'Community/Learning - Region',
    name: 'Startit.rs',
    type: 'Community',
    use: 'SR tech zajednica, vesti, poslovi',
    url: 'https://startit.rs/',
    tags: ['serbia', 'community', 'tech'],
    rating: 4.3,
    isLocal: true,
    isFeatured: true
  },
  {
    id: 'it-konekt',
    category: 'Community/Learning - Region',
    name: 'IT Konekt',
    type: 'Community',
    use: 'IT događaji i konferencije',
    url: 'https://it-konekt.com/',
    tags: ['events', 'conferences', 'networking'],
    rating: 4.2,
    isLocal: true
  },
  {
    id: 'r-serbia',
    category: 'Community/Learning - Region',
    name: 'r/serbia',
    type: 'Community',
    use: 'Reddit zajednica Srbije',
    url: 'https://www.reddit.com/r/serbia/',
    tags: ['reddit', 'serbia', 'community'],
    rating: 4.0,
    isLocal: true
  },

  // Community/Learning - Global
  {
    id: 'indie-hackers',
    category: 'Community/Learning - Global',
    name: 'Indie Hackers',
    type: 'Community',
    use: 'Founders & makers zajednica',
    url: 'https://www.indiehackers.com/',
    tags: ['indie', 'founders', 'makers'],
    rating: 4.6,
    isFeatured: true
  },
  {
    id: 'r-digitalnomad',
    category: 'Community/Learning - Global',
    name: 'r/digitalnomad',
    type: 'Community',
    use: 'Digital nomad zajednica',
    url: 'https://www.reddit.com/r/digitalnomad/',
    tags: ['nomad', 'reddit', 'global'],
    rating: 4.4
  },
  {
    id: 'gitlab-handbook',
    category: 'Community/Learning - Global',
    name: 'GitLab Remote Handbook',
    type: 'Guide',
    use: 'Praksa remote first kompanije',
    url: 'https://about.gitlab.com/handbook/',
    tags: ['remote', 'handbook', 'best-practices'],
    rating: 4.7,
    isFeatured: true
  },

  // Career Tools
  {
    id: 'flowcv',
    category: 'Career Tools',
    name: 'FlowCV',
    type: 'Resume',
    use: 'ATS-friendly CV graditelj',
    url: 'https://flowcv.com/',
    tags: ['resume', 'ats', 'builder'],
    rating: 4.4,
    isFeatured: true
  },
  {
    id: 'jobscan',
    category: 'Career Tools',
    name: 'Jobscan',
    type: 'ATS checker',
    use: 'Skener CV-a za ATS',
    url: 'https://www.jobscan.co/',
    tags: ['ats', 'resume', 'optimization'],
    rating: 4.3
  },
  {
    id: 'pramp',
    category: 'Career Tools',
    name: 'Pramp',
    type: 'Interview practice',
    use: 'Besplatne tehničke probe',
    url: 'https://www.pramp.com/',
    tags: ['interview', 'practice', 'technical'],
    rating: 4.2
  },

  // Travel/Visas
  {
    id: 'croatia-digital-nomad',
    category: 'Travel/Visas',
    name: 'Croatia – Digital Nomad (MUP)',
    type: 'Visa',
    use: 'Privremeni boravak za digitalne nomade',
    url: 'https://mup.gov.hr/',
    tags: ['croatia', 'visa', 'digital-nomad'],
    rating: 4.1,
    isLocal: true
  },
  {
    id: 'schengen-visa',
    category: 'Travel/Visas',
    name: 'Schengen Visa Info (EU)',
    type: 'Visa',
    use: 'Opšti vodič za EU/Schengen',
    url: 'https://visa.europa.eu/',
    tags: ['eu', 'schengen', 'visa'],
    rating: 3.9
  }
];

// Must-have MVP modules
export const mvpModules: FeatureModule[] = [
  {
    id: 'user-registration',
    name: 'Registracija + profil',
    description: 'Kompletan profil sa skillovima, senioriteu, jezicima, platama',
    status: 'mvp',
    category: 'Authentication',
    priority: 1,
    technicalNotes: 'Next.js + Supabase Auth + PostgreSQL'
  },
  {
    id: 'smart-match',
    name: 'Smart Match poslova',
    description: 'Personalizovane preporuke po roli, senioritetu, vremenskoj zoni',
    status: 'mvp',
    category: 'Job Matching',
    priority: 2,
    dependencies: ['user-registration'],
    technicalNotes: 'TF-IDF + embeddings za matching'
  },
  {
    id: 'daily-digest',
    name: 'Jutarnji digest',
    description: 'Mail/Telegram obaveštenja novih oglasa po korisniku',
    status: 'mvp',
    category: 'Notifications',
    priority: 3,
    dependencies: ['user-registration', 'smart-match'],
    technicalNotes: 'Resend/Nodemailer + Telegram Bot API'
  },
  {
    id: 'auto-apply',
    name: 'Auto-aplikacija',
    description: 'CV + cover letter generator + praćenje statusa',
    status: 'mvp',
    category: 'Application',
    priority: 4,
    dependencies: ['user-registration'],
    technicalNotes: 'AI generacija (OpenAI GPT) + tracking DB'
  },
  {
    id: 'interview-calendar',
    name: 'Kalendar razgovora',
    description: 'Cal.com/Calendly integracija',
    status: 'mvp',
    category: 'Scheduling',
    priority: 5,
    technicalNotes: 'Cal.com API webhooks'
  },
  {
    id: 'salary-calculator',
    name: 'Salary & COL kalkulator',
    description: 'Levels.fyi + Numbeo/Expatistan integracija',
    status: 'mvp',
    category: 'Salary Tools',
    priority: 6,
    technicalNotes: 'API integracije + lokalni kalkulatori'
  },
  {
    id: 'tax-guide',
    name: 'Poreski vodič za Srbiju',
    description: 'Paušal/doo, e-Faktura, GDPR/ZZPL',
    status: 'mvp',
    category: 'Legal',
    priority: 7,
    isLocal: true,
    technicalNotes: 'Statički sadržaj + kalkulatori'
  },
  {
    id: 'payments-hub',
    name: 'Plaćanja & naplata',
    description: 'Wise/Payoneer + MoR: Paddle/Lemon Squeezy',
    status: 'mvp',
    category: 'Payments',
    priority: 8,
    technicalNotes: 'Vanjski linkovi + vodiči'
  },
  {
    id: 'e-contracts',
    name: 'E-potpis & ugovori',
    description: 'oneNDA + DocuSign/Dropbox Sign',
    status: 'mvp',
    category: 'Legal',
    priority: 9,
    technicalNotes: 'Šabloni + API integracije'
  },
  {
    id: 'coworking-map',
    name: 'Coworking mapa Balkana',
    description: 'Mapa i cene coworking prostora + internet heatmap',
    status: 'mvp',
    category: 'Coworking',
    priority: 10,
    isLocal: true,
    technicalNotes: 'MapBox + lokalna baza podataka'
  }
];

// Categories for easy filtering
export const toolboxCategories = [
  'Job Boards - Global',
  'Job Boards - Balkans', 
  'Freelance Marketplaces',
  'Payroll & EOR',
  'Payments/Banking',
  'Invoicing & Accounting',
  'Legal/Tax/Gov - RS',
  'Legal/Tax/Gov - HR',
  'Legal/Tax/Gov - EU',
  'Contracts / E-sign',
  'Coworking/Nomad',
  'Internet/ISP - RS',
  'Security/Privacy',
  'Communication/Collab',
  'Productivity/PM',
  'Time Tracking/Focus',
  'Cloud/Dev/Deploy',
  'Monitoring/Logs',
  'Storage/Files',
  'Salary & Cost',
  'Insurance',
  'Localization',
  'Job Data/APIs',
  'Community/Learning - Region',
  'Community/Learning - Global',
  'Career Tools',
  'Travel/Visas'
];
