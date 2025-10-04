// Dodatni balkanski izvori za hybrid/onsite poslove
// Dodati u scraper-sources.ts na kraju

export const additionalBalkanSources = [
  {
    id: 'mjob-rs',
    name: 'MJob.rs - Omladinska zadruga',
    website: 'https://www.mjob.rs',
    baseUrl: 'https://www.mjob.rs',
    searchEndpoints: ['/poslovi', '/pretraga-poslova', '/kategorije'],
    isActive: true,
    priority: 9,
    rateLimit: { 
      requestsPerMinute: 30, 
      delayBetweenRequests: 2000 
    },
    selectors: {
      jobList: '.job-item, .posao-item, .oglas',
      jobTitle: '.posao-naslov, .job-title, h3',
      company: '.firma, .company, .poslodavac',
      location: '.lokacija, .location, .grad',
      description: '.opis, .description, .sadrzaj',
      applicationUrl: 'a, .apply-link, .prijava-link',
      postedDate: '.datum, .posted-date'
    },
    searchTerms: ['IT', 'programiranje', 'dizajn', 'marketing', 'admin', 'prodaja'],
    maxPages: 5,
    country: ['RS', 'BALKAN'],
    regions: ['BALKAN'],
    countriesISO: ['RS'],
    tags: ['balkan', 'srbija', 'omladinska-zadruga', 'onsite', 'hybrid', 'students', 'svi-poslovi'],
    errorCount: 0,
    successRate: 85.0
  },

  {
    id: 'mojedelo-si',
    name: 'MojeDelo.com (Slovenia)',
    website: 'https://www.mojedelo.com',
    baseUrl: 'https://www.mojedelo.com',
    searchEndpoints: ['/prosta-delovna-mesta', '/iskanje-zaposlitve', '/it-zaposlitve'],
    isActive: true,
    priority: 8,
    rateLimit: { 
      requestsPerMinute: 20, 
      delayBetweenRequests: 3000 
    },
    selectors: {
      jobList: '.job-listing, .delo-item, .oglas',
      jobTitle: '.naslov-dela, .job-title, h3 a',
      company: '.podjetje, .company, .delodajalec',
      location: '.lokacija, .location, .kraj', 
      description: '.opis-dela, .description, .vsebina',
      applicationUrl: '.prijava, .apply-link, a',
      postedDate: '.datum-objave, .date'
    },
    searchTerms: ['IT', 'programiranje', 'razvoj', 'tehnologija', 'racunalnistvo'],
    maxPages: 4,
    country: ['SI', 'BALKAN'],
    regions: ['BALKAN', 'EU'],
    countriesISO: ['SI'],
    tags: ['balkan', 'slovenija', 'slovenia', 'onsite', 'hybrid', 'lokalni-poslovi'],
    errorCount: 0,
    successRate: 80.0
  },

  {
    id: 'mojposao-si',
    name: 'MojPosao.si (Slovenia)',
    website: 'https://www.mojposao.si',
    baseUrl: 'https://www.mojposao.si',
    searchEndpoints: ['/prosta-delovna-mesta', '/zaposlitve'],
    isActive: true,
    priority: 8,
    rateLimit: { 
      requestsPerMinute: 20, 
      delayBetweenRequests: 3000 
    },
    selectors: {
      jobList: '.posao-item, .job-listing',
      jobTitle: '.job-title, .naslov',
      company: '.company, .podjetje',
      location: '.location, .lokacija',
      description: '.description, .opis',
      applicationUrl: 'a, .apply-btn'
    },
    searchTerms: ['IT', 'tehnologija', 'programiranje'],
    maxPages: 3,
    country: ['SI', 'BALKAN'],
    regions: ['BALKAN', 'EU'],
    countriesISO: ['SI'],
    tags: ['balkan', 'slovenija', 'onsite', 'hybrid'],
    errorCount: 0,
    successRate: 75.0
  },

  {
    id: 'mojaplata-mk',
    name: 'MojaPlata.mk (Macedonia)',
    website: 'https://mojaplata.mk',
    baseUrl: 'https://mojaplata.mk',
    searchEndpoints: ['/raboti', '/prebaruvanje-raboti', '/it-raboti'],
    isActive: true,
    priority: 8,
    rateLimit: { 
      requestsPerMinute: 20, 
      delayBetweenRequests: 3000 
    },
    selectors: {
      jobList: '.job-listing, .rabota-item, .oglas',
      jobTitle: '.naslov-rabota, .job-title, h3',
      company: '.kompanija, .company, .firma',
      location: '.lokacija, .location, .grad',
      description: '.opis, .description, .detali',
      applicationUrl: '.prijava, .apply-link, a',
      postedDate: '.datum, .date'
    },
    searchTerms: ['IT', 'programiranje', 'razvoj', 'tehnologii', 'kompjuteri'],
    maxPages: 4,
    country: ['MK', 'BALKAN'],
    regions: ['BALKAN'],
    countriesISO: ['MK'],
    tags: ['balkan', 'makedonija', 'macedonia', 'north-macedonia', 'onsite', 'hybrid', 'lokalni-poslovi'],
    errorCount: 0,
    successRate: 75.0
  },

  {
    id: 'vrabotuvanje-mk',
    name: 'Vrabotuvanje.com.mk (Macedonia)',
    website: 'https://vrabotuvanje.com.mk',
    baseUrl: 'https://vrabotuvanje.com.mk',
    searchEndpoints: ['/oglasi', '/prebaruvanje'],
    isActive: true,
    priority: 7,
    rateLimit: { 
      requestsPerMinute: 15, 
      delayBetweenRequests: 4000 
    },
    selectors: {
      jobList: '.oglas-item, .job-item',
      jobTitle: '.naslov, .title',
      company: '.firma, .company',
      location: '.lokacija, .location',
      description: '.opis, .description',
      applicationUrl: 'a'
    },
    searchTerms: ['IT', 'programiranje', 'tehnologija'],
    maxPages: 3,
    country: ['MK', 'BALKAN'],
    regions: ['BALKAN'],
    countriesISO: ['MK'],
    tags: ['balkan', 'makedonija', 'onsite', 'hybrid'],
    errorCount: 0,
    successRate: 70.0
  },

  {
    id: 'posao-ba-hybrid',
    name: 'Posao.ba - Hybrid/Onsite',
    website: 'https://posao.ba',
    baseUrl: 'https://posao.ba',
    searchEndpoints: ['/pretraga-poslova', '/kategorije/it', '/poslovi-bih'],
    isActive: true,
    priority: 9,
    rateLimit: { 
      requestsPerMinute: 25, 
      delayBetweenRequests: 2500 
    },
    selectors: {
      jobList: '.job-listing, .posao-item, .oglas',
      jobTitle: '.naslov-posla, .job-title, h3 a',
      company: '.kompanija, .company, .poslodavac',
      location: '.lokacija, .location, .grad',
      description: '.opis, .description, .sadrzaj-oglasa',
      applicationUrl: '.prijava, .apply-link, a',
      postedDate: '.datum, .posted-date'
    },
    searchTerms: ['IT', 'programiranje', 'razvoj', 'tehnologija', 'admin', 'dizajn'],
    maxPages: 5,
    country: ['BA', 'BALKAN'],
    regions: ['BALKAN'],
    countriesISO: ['BA'],
    tags: ['balkan', 'bosna', 'bosnia', 'onsite', 'hybrid', 'lokalni-poslovi', 'svi-poslovi'],
    errorCount: 0,
    successRate: 82.0
  },

  {
    id: 'oglasibih-ba',
    name: 'OglasiBiH.ba (Bosnia)',
    website: 'https://oglasibih.ba',
    baseUrl: 'https://oglasibih.ba',
    searchEndpoints: ['/poslovi', '/kategorija/it-poslovi'],
    isActive: true,
    priority: 7,
    rateLimit: { 
      requestsPerMinute: 20, 
      delayBetweenRequests: 3000 
    },
    selectors: {
      jobList: '.oglas-item, .job-item',
      jobTitle: '.naslov, .title',
      company: '.firma, .company',
      location: '.lokacija, .location',
      description: '.opis, .description',
      applicationUrl: 'a'
    },
    searchTerms: ['IT', 'posao', 'zaposlenje'],
    maxPages: 3,
    country: ['BA', 'BALKAN'],
    regions: ['BALKAN'],
    countriesISO: ['BA'],
    tags: ['balkan', 'bosna', 'onsite', 'hybrid'],
    errorCount: 0,
    successRate: 70.0
  }
];
