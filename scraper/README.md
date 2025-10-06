# Balkan Jobs Scraper 🕷️

Python scraper za prikupljanje oglasa za poslove sa Balkan izvora (Infostud, Halo Oglasi, MojPosao, Posao.ba, MojeDelo) i internacionalnih remote job board-ova (RemoteOK, WeWorkRemotely, itd.).

## Features

- ✅ **Crawlee framework** - robustan scraping sa anti-bot zaštitom
- ✅ **Playwright** - headless browser za scraping JavaScript sajtova
- ✅ **Smart filtering** - samo oglasi iz zadnjih 24-48h
- ✅ **Deduplication** - provera da oglas već ne postoji u bazi
- ✅ **Quality scoring** - automatska ocena kvaliteta podataka
- ✅ **Supabase integration** - automatski upsert u produkcijsku bazu
- ✅ **Dry run mode** - testiranje bez pisanja u bazu

## Struktura

```
scraper/
├── scrapers/          # Scrapers za pojedinačne izvore
│   ├── infostud.py    # Poslovi Infostud (Srbija)
│   ├── remoteok.py    # RemoteOK (Remote)
│   └── ...            # (TODO: dodati ostale)
├── utils/
│   ├── database.py    # Supabase upsert logika
│   ├── normalizer.py  # Normalizacija podataka
│   └── logger.py      # Logger
├── main.py            # Main orchestrator
├── requirements.txt   # Python dependencies
└── .env               # Environment variables
```

## Setup

### 1. Install Python dependencies

```bash
cd scraper
pip install -r requirements.txt
```

**Potreban je Python 3.11+**

### 2. Install Playwright browsers

```bash
playwright install chromium
```

### 3. Create `.env` file

```bash
cp .env.example .env
```

Popuni `.env` sa svojim credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

MAX_JOBS_PER_SOURCE=50
SCRAPE_HOURS_BACK=24
DRY_RUN=false
```

## Usage

### Run scraper

```bash
# Production mode (piše u bazu)
python main.py

# Dry run mode (samo testira, ne piše u bazu)
DRY_RUN=true python main.py

# Ograniči broj oglasa po izvoru
MAX_JOBS_PER_SOURCE=20 python main.py
```

### Output

```
============================================================
🚀 Balkan Jobs Scraper Started
============================================================
Max jobs per source: 50
Dry run mode: false

📍 Scraping HYBRID/ONSITE jobs...

🇷🇸 Scraping Infostud...
[12:34:56] ℹ️  Starting Infostud scraper (max: 50 jobs)
[12:34:58] ℹ️  Scraped: Senior Frontend Developer at Tech Srbija
[12:34:59] ℹ️  Scraped: Backend Engineer at Nordeus
...
[12:35:10] ✅ Infostud scraper completed: 25 jobs

🌍 Scraping REMOTE jobs...

🌐 Scraping RemoteOK...
[12:35:12] ℹ️  Starting RemoteOK scraper (max: 50 jobs)
[12:35:15] ℹ️  Scraped: Full Stack Developer at GitLab
...
[12:35:30] ✅ RemoteOK scraper completed: 40 jobs

============================================================
📊 SUMMARY
============================================================
Total HYBRID jobs scraped: 25
Total REMOTE jobs scraped: 40

💾 Upserting to database...
[12:35:32] ✅ Hybrid jobs: 18 inserted, 7 skipped
[12:35:34] ✅ Remote jobs: 35 inserted, 5 skipped

============================================================
✅ Scraper completed in 45.23s
============================================================
```

## Data Schema

### Hybrid/Onsite jobs → `hybrid_jobs` table

```python
{
    'external_id': 'infostud-12345',
    'source_name': 'Poslovi Infostud',
    'title': 'Senior Frontend Developer',
    'company_name': 'Tech Srbija',
    'location': 'Beograd, Srbija',
    'work_type': 'hybrid',
    'country_code': 'RS',
    'region': 'BALKAN',
    'category': 'software-engineering',
    'description': '...',
    'application_url': 'https://...',
    'experience_level': 'senior',
    'employment_type': 'full-time',
    'salary_min': 2000,
    'salary_max': 3500,
    'salary_currency': 'EUR',
    'skills': ['React', 'TypeScript', 'Next.js'],
    'posted_date': '2025-10-05T12:00:00',
    'scraped_at': '2025-10-06T12:35:10',
    'quality_score': 85
}
```

### Remote jobs → `jobs` table

```python
{
    'external_id': 'remoteok-abc123',
    'source_name': 'RemoteOK',
    'title': 'Full Stack Developer',
    'company_name': 'GitLab',
    'location': 'Remote',
    'work_type': 'remote',
    'country_code': None,
    'region': 'GLOBAL',
    'category': 'software-engineering',
    # ... ostali podaci slično kao gore
}
```

## Adding New Scrapers

### 1. Create new scraper file

```python
# scrapers/mojposao.py
from crawlee.playwright_crawler import (
    PlaywrightCrawler,
    PlaywrightCrawlingContext
)
from utils.logger import Logger

logger = Logger("mojposao")

async def scrape_mojposao(max_jobs: int = 50):
    jobs = []
    
    async def request_handler(context: PlaywrightCrawlingContext):
        # Your scraping logic here
        pass
    
    crawler = PlaywrightCrawler(
        request_handler=request_handler,
        headless=True
    )
    
    await crawler.run(["https://www.mojposao.net/"])
    
    return jobs
```

### 2. Add to main.py

```python
from scrapers.mojposao import scrape_mojposao

# In main():
try:
    logger.info("🇭🇷 Scraping MojPosao...")
    mojposao_jobs = await scrape_mojposao(max_jobs)
    all_jobs['hybrid'].extend(mojposao_jobs)
    logger.success(f"MojPosao: {len(mojposao_jobs)} jobs scraped")
except Exception as e:
    logger.error("MojPosao scraper failed", e)
```

## Scheduling

### Option 1: Manual run (lokalno)

Pokreni svaki dan ručno ili sa cron job-om:

```bash
# Windows Task Scheduler
# Linux/Mac crontab:
0 6 * * * cd /path/to/scraper && python main.py
```

### Option 2: Automated (GitHub Actions, Render, Railway)

Možemo dodati nakon testiranja scrapers-a.

## Implemented Scrapers

### ✅ Hybrid/Onsite Jobs (Balkan) - 5 scrapers
- ✅ **Infostud** (Srbija) - https://www.poslovi.infostud.com
- ✅ **Halo Oglasi** (Srbija) - https://www.halooglasi.rs
- ✅ **MojPosao** (Hrvatska) - https://www.mojposao.net
- ✅ **Posao.ba** (BiH) - https://www.posao.ba
- ✅ **MojeDelo** (Slovenija) - https://www.mojedelo.com

### ✅ Remote Jobs (Global) - 8 scrapers
- ✅ **RemoteOK** - https://remoteok.com
- ✅ **WeWorkRemotely** - https://weworkremotely.com
- ✅ **Remotive** - https://remotive.io
- ✅ **JustRemote** - https://justremote.co
- ✅ **Remote.co** - https://remote.co
- ✅ **Working Nomads** - https://www.workingnomads.com
- ✅ **Remote.io** - https://remote.io
- ✅ **Himalayas** - https://himalayas.app

**Total: 13 scrapers** covering all major Balkan job boards + top 8 global remote job sites!

## Expected Daily Output

With default settings:
- **Hybrid/Onsite**: 5 scrapers × 100 jobs = **~500 jobs/day** ✅
- **Remote**: 8 scrapers × 200 jobs = **~1,600 jobs/day** ✅
- **TOTAL**: **~2,100 jobs/day** 🎯

Limits can be adjusted in `.env`:
- `MAX_JOBS_PER_SOURCE_REMOTE=200` (for remote scrapers)
- `MAX_JOBS_PER_SOURCE_HYBRID=100` (for hybrid scrapers)

## TODO

- [ ] Dodati date filtering (samo oglasi iz zadnjih 24h)
- [ ] Poboljšati quality scoring
- [ ] Dodati error recovery i retry logic
- [ ] Unit tests
- [ ] Dodati više remote izvora (Remote.co, FlexJobs, Remote.com, itd.)

## Notes

- Scraper se pokreće **lokalno** (ne ide na GitHub)
- Dodati `scraper/` u `.gitignore` (opciono)
- Svaki scraper može imati različitu strukturu HTML-a
- Crawlee automatski handluje proxy rotation i anti-bot zaštitu
- Upsert u Supabase radi na `external_id` (deduplikacija)

---

**Autor:** RemoteBalkan Team  
**Verzija:** 1.0.0  
**Datum:** Oktobar 2025
