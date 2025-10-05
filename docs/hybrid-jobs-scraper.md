# Hybrid/Onsite Jobs Scraper

Automatski scraper za prikupljanje hybrid i onsite poslova sa Balkanskih izvora.

## 🎯 Cilj

Prikuplja poslove koji nisu fully remote (hybrid, onsite, flexible) sa sledećih izvora:
- **Poslovi Infostud** (Srbija)
- **Halo Oglasi** (Srbija)
- **MojPosao.net** (Hrvatska)
- **Posao.ba** (BiH)
- **MojeDelo.com** (Slovenija)

## 📦 Instalacija

Sve potrebne zavisnosti su već instalirane:
- `axios` - za HTTP requests
- `cheerio` - za HTML parsing

## 🚀 Pokretanje

### Manuelno (lokalno)

```bash
# Live run (piše u bazu)
npm run sync:hybrid-jobs

# Dry run (samo testiranje, ne piše u bazu)
DRY_RUN=1 npm run sync:hybrid-jobs
```

### Environment Varijable

Potrebne varijable:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DRY_RUN=1  # (opciono) za dry run mod
LOG_FORMAT=json  # (opciono) za JSON log output
```

## 📊 Output

Scraper prikuplja sledeće podatke za svaki posao:

| Polje | Tip | Opis |
|-------|-----|------|
| `external_id` | string | Jedinstveni ID iz izvora |
| `source_name` | string | Ime izvora (npr. "Halo Oglasi") |
| `title` | string | Naziv pozicije |
| `company_name` | string | Ime kompanije |
| `location` | string | Lokacija (grad, država) |
| `work_type` | enum | `hybrid`, `onsite`, `flexible`, `remote-optional` |
| `country_code` | string | ISO kod države (RS, HR, BA, SI, MK) |
| `region` | string | `BALKAN` |
| `category` | string | Kategorija posla |
| `description` | string | Opis pozicije |
| `application_url` | string | Link za prijavu |
| `experience_level` | enum | `junior`, `mid`, `senior` |
| `employment_type` | enum | `full-time`, `part-time`, `contract` |
| `salary_min` | number | Minimalna plata |
| `salary_max` | number | Maksimalna plata |
| `salary_currency` | string | Valuta (EUR, USD, RSD, BAM, HRK) |
| `skills` | array | Lista skillova |
| `technologies` | array | Lista tehnologija |
| `posted_date` | timestamp | Datum objave |
| `quality_score` | number | Kvalitet oglasa (0-100) |

## 🧮 Quality Score

Scraper automatski kalkuliše quality score za svaki posao:

- **Base score**: 50
- **+15**: Ima salary range
- **+10**: Ima company name
- **+10**: Ima opis duži od 100 karaktera
- **+10**: Ima skills
- **+5**: Ima experience level

**Max score**: 100

Poslovi sa quality_score >= 50 su vidljivi u `hybrid_jobs_view`.

## 🔄 Upsert Logika

Scraper koristi `upsert` sa `onConflict: 'external_id,source_name'`:
- Ako posao već postoji → update
- Ako je nov → insert
- `ignoreDuplicates: false` → uvek ažuriraj postojeće

## 📝 Trenutno Stanje

### ✅ Implementirano
- Scraper framework
- Mock data za sve izvore
- Database upsert logika
- Quality score calculation
- Dry run mod
- Rate limiting (2s između izvora)
- Comprehensive logging

### 🚧 TODO
- [ ] Implementirati pravi scraper za Poslovi Infostud
- [ ] Implementirati pravi scraper za Halo Oglasi
- [ ] Implementirati pravi scraper za MojPosao.net
- [ ] Implementirati pravi scraper za Posao.ba
- [ ] Implementirati pravi scraper za MojeDelo.com
- [ ] Dodati error retry logiku
- [ ] Dodati robots.txt check
- [ ] Dodati deduplication logiku
- [ ] Dodati stats tracking (feed_stats tabela)

## 🛠️ Razvoj

### Dodavanje Novog Izvora

1. Dodaj source definiciju u `HYBRID_JOB_SOURCES`:

```typescript
{
  id: 'source-id',
  name: 'Source Name',
  country: 'Država',
  countryCode: 'XX',
  baseUrl: 'https://example.com',
  scrapeUrl: 'https://example.com/jobs',
  enabled: true,
  scraper: scrapeFunctionName
}
```

2. Implementiraj scraper funkciju:

```typescript
async function scrapeFunctionName(source: ScraperSource): Promise<HybridJobInsert[]> {
  logger.event('scraper_start', { source: source.id })
  const jobs: HybridJobInsert[] = []
  
  try {
    // Tvoj scraping kod ovde
    const response = await axios.get(source.scrapeUrl)
    const $ = cheerio.load(response.data)
    
    // Parse HTML i popuni jobs array
    
  } catch (error) {
    logger.error(`Failed to scrape ${source.id}`, error)
  }
  
  logger.event('scraper_complete', { source: source.id, count: jobs.length })
  return jobs
}
```

### Helper Funkcije

Dostupne helper funkcije:
- `normalizeWorkType(text)` - Detektuje work type iz teksta
- `extractSalary(text)` - Izvlači salary range
- `normalizeCurrency(curr)` - Normalizuje valutu
- `extractExperienceLevel(text)` - Detektuje experience level
- `calculateQualityScore(job)` - Kalkuliše quality score

## 📈 Monitoring

Scraper loguje sledeće evente:

```json
{ "evt": "hybrid_sync_start", "sources": [...], "dryRun": false }
{ "evt": "scraper_start", "source": "infostud-rs" }
{ "evt": "scraper_complete", "source": "infostud-rs", "count": 25 }
{ "evt": "hybrid_jobs_upsert_start", "count": 125 }
{ "evt": "hybrid_jobs_upsert_success", "inserted": 125, "sources": [...] }
{ "evt": "hybrid_sync_complete", "totalJobs": 125, "durationMs": 15000 }
```

## 🔒 Best Practices

1. **Rate Limiting**: 2 sekunde između izvora
2. **Timeout**: 30 sekundi po request-u
3. **Error Handling**: Continue sa sledećim izvorom ako jedan faila
4. **Dry Run**: Testiraj pre live run-a
5. **Logging**: Comprehensive event logging za debugging

## 📞 Support

Za pitanja ili probleme, otvori Issue na GitHub-u.
