# Quick Start Guide

## 1. Instalacija

### Preduslovi
- Python 3.11 ili noviji
- pip

### Install dependencies

```powershell
cd scraper
pip install -r requirements.txt
```

### Install Playwright browser

```powershell
playwright install chromium
```

## 2. Konfiguracija

### Kreiraj `.env` fajl

```powershell
cd scraper
cp .env.example .env
```

### Popuni credentials u `.env`

```env
SUPABASE_URL=https://kuxqyrhkqjfbnwzqfzey.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tvoj_service_role_key

MAX_JOBS_PER_SOURCE=50
SCRAPE_HOURS_BACK=24
DRY_RUN=false
```

**Gde naći Supabase credentials:**
1. Idi na: https://supabase.com/dashboard/project/kuxqyrhkqjfbnwzqfzey/settings/api
2. Kopiraj `service_role` key (ne anon key!)

## 3. Testiranje (Dry Run)

```powershell
cd scraper
python main.py
```

Prvo će pokrenuti u DRY_RUN mode ako je `DRY_RUN=true` u `.env`.

**Output:**

```
============================================================
🚀 Balkan Jobs Scraper Started
============================================================
Max jobs per source: 50
Dry run mode: true

📍 Scraping HYBRID/ONSITE jobs...

🇷🇸 Scraping Infostud...
[12:34:56] ℹ️  Starting Infostud scraper (max: 50 jobs)
[12:35:10] ✅ Infostud scraper completed: 25 jobs

🌍 Scraping REMOTE jobs...

🌐 Scraping RemoteOK...
[12:35:12] ℹ️  Starting RemoteOK scraper (max: 50 jobs)
[12:35:30] ✅ RemoteOK scraper completed: 40 jobs

============================================================
📊 SUMMARY
============================================================
Total HYBRID jobs scraped: 25
Total REMOTE jobs scraped: 40

⚠️  DRY RUN MODE - Not writing to database
```

## 4. Production Run

Kada si zadovoljan rezultatima, promeni u `.env`:

```env
DRY_RUN=false
```

I pokreni ponovo:

```powershell
python main.py
```

Sada će upisati oglase u Supabase! ✅

## 5. Provera rezultata

Idi na sajt i proveri:
- **Remote oglasi:** https://www.balkan-remote.com/poslovi
- **Hybrid oglasi:** https://www.balkan-remote.com/firme

## 6. Dnevno pokretanje

Možeš pokretati scraper:
- **Ručno** - svaki dan kad želiš
- **Windows Task Scheduler** - automatski u određeno vreme
- **Cron job** (Linux/Mac) - automatski

### Windows Task Scheduler primer

```powershell
# Action: Start a program
Program/script: python
Arguments: D:\ProjektiApp\remotebalkan\scraper\main.py
Start in: D:\ProjektiApp\remotebalkan\scraper
```

---

**Gotovo! 🎉**

Scraper je spreman za korišćenje. Sve što treba je pokrenuti `python main.py` svaki dan (ili automatski) i oglasi će se puniti u bazu.
