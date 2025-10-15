# RemoteBalkan Scraper - Quick Start Guide

## 📋 Summary

**Working Sources:**
- ✅ **Remote jobs (API/RSS)**: 18 sources, ~1500+ jobs
- ⚠️ **Balkan jobs (HTML)**: 1 source working (posaohr), others need fixing

**Current Database:**
- `jobs` table: **1,595 remote jobs** ✅
- `hybrid_jobs` table: **55 Balkan jobs** ⚠️ (needs more data)

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Configure .env

Create `.env` file (or use `../.env.local`):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
```

### 3. Run Scraper

**Test run (no database save):**
```bash
python runner.py --limit 10 --no-save
```

**Full scrape + save to file:**
```bash
python runner.py --limit 100
# Output: out/jobs.ndjson
```

**Load to Supabase:**
```bash
python load.py
```

---

## 📚 Commands

### Scraping

```bash
# List all sources
python runner.py --list-sources

# Scrape specific source
python runner.py --source remoteok --limit 50

# Scrape multiple sources
python runner.py --source remoteok --source jobicy --limit 50

# Remote jobs only
python runner.py --remote-only --limit 100

# Balkan jobs only
python runner.py --hybrid-only --limit 100

# Include disabled sources
python runner.py --include-disabled
```

### Loading to Database

```bash
# Load scraped jobs from NDJSON to Supabase
python load.py

# Check database counts
python check_db_counts.py
```

---

## 📊 Working Sources

### Remote Jobs (18 enabled, all working)

**API Sources:**
- `remoteok` - RemoteOK API (100+ jobs)
- `jobicy` - Jobicy API (100+ jobs)
- `jobicy_junior` - Jobicy Junior (10+ jobs)
- `greenhouse_gitlab` - GitLab (50+ jobs)
- `greenhouse_automattic` - Automattic/WordPress (20+ jobs)
- `greenhouse_canonical` - Canonical/Ubuntu (30+ jobs)
- `greenhouse_remotecom` - Remote.com (40+ jobs)
- `greenhouse_mozilla` - Mozilla (20+ jobs)
- `greenhouse_bitgo` - BitGo (10+ jobs)
- `greenhouse_mercury` - Mercury (15+ jobs)
- `lever_welocalize` - Welocalize (50+ jobs)
- `lever_ro` - Ro Health (10+ jobs)
- `recruitee_wallarm` - Wallarm (5+ jobs)
- `recruitee_tiugo` - Tiugo (5+ jobs)

**RSS Sources:**
- `weworkremotely` - Programming jobs (50+ jobs)
- `weworkremotely_all` - All categories (85+ jobs)

**HTML Sources:**
- `working_nomads` - Working Nomads
- `support_driven` - Support Driven
- `skipthedrive_entry` - Entry-level jobs
- `remote_co_entry` - Remote.co Entry-level

### Balkan Jobs (4 enabled, 1 working)

**Working:**
- ✅ `posaohr` - Posao.hr Croatia (HTML, ~200 jobs/day)

**Need Fixing:**
- ❌ `infostud` - Infostud Serbia (NextJS, needs debugging)
- ❌ `mojposao` - MojPosao Croatia (HTML, selectors broken)
- ❌ `mojedelo` - MojeDelo Slovenia (HTML, selectors broken)

---

## 🔧 Troubleshooting

### No jobs scraped from HTML sources

HTML sources often break due to website changes. Check:

1. **Inspect selectors** - websites change their HTML structure
2. **Check pagination** - might be on different URL pattern
3. **Test manually** - visit URL and see if jobs are visible

### Environment variables not loading

Make sure `.env` or `../.env.local` exists with valid credentials.

### Encoding errors on Windows

Fixed! All emoji replaced with `[TAG]` format.

---

## 📝 Data Flow

```
1. SCRAPE:  python runner.py → out/jobs.ndjson
2. LOAD:    python load.py → Supabase (jobs + hybrid_jobs tables)
3. VERIFY:  python check_db_counts.py
```

---

## 🎯 Recommended Daily Run

```bash
# Morning run (get fresh jobs)
cd scraper

# 1. Scrape remote jobs (reliable sources)
python runner.py --remote-only --limit 200
# → Expect: ~2000+ jobs from API/RSS sources

# 2. Scrape Balkan jobs (only working source for now)
python runner.py --source posaohr --limit 300
# → Expect: ~200 jobs from Croatia

# 3. Load to database
python load.py
# → Upserts to Supabase (deduplicates automatically)

# 4. Verify
python check_db_counts.py
```

---

## 🐛 Fix Broken Sources

To fix `infostud`, `mojposao`, `mojedelo`:

1. Check analyze scripts in `scraper/`:
   - `analyze_infostud.py`
   - `analyze_mojposao.py`
   - `analyze_mojedelo.py`

2. Update selectors in `config/jobsites.yaml`

3. Test with:
   ```bash
   python runner.py --source infostud --limit 5 --no-save
   ```

---

**Contact:** Need help? Check existing analyze_*.py scripts for debugging examples.

