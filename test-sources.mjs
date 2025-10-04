import { allScraperSources } from './src/data/scraper-sources.ts';

console.log('Total sources:', allScraperSources.length);

const balkanSources = allScraperSources.filter(source => 
  source.id.includes('halooglasi') || source.id.includes('nsz')
);

console.log('Balkan sources found:', balkanSources.length);
balkanSources.forEach(source => {
  console.log(`- ${source.id}: ${source.name} (Active: ${source.isActive})`);
});

const allBalkanSources = allScraperSources.filter(source => 
  source.tags && source.tags.includes('balkan')
);

console.log('\nAll Balkan tagged sources:', allBalkanSources.length);
allBalkanSources.forEach(source => {
  console.log(`- ${source.id}: ${source.name}`);
});