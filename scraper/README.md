# RemoteBalkan Job Scraper 🚀

Automatizirano prikupljanje oglasa za poslove sa globalnih remote job board-ova i Balkan izvora.

## ⚡ Quick Start

```bash
# 1. Setup
cd scraper
pip install -r requirements.txt

# 2. Scrape remote jobs
python scrape.py --remote --limit 100

# 3. Load to Supabase
python scrape.py --load

# 4. Check database
python scrape.py --check
```

✅ **Done!** Očekuj **600-800 novih poslova** od pouzdanih API/RSS izvora.

---

## 📊 Current Status

**Database:**
- ✅ `jobs` table: **1,821 remote jobs**
- ⚠️ `hybrid_jobs` table: **55 Balkan jobs** (needs more)

**Working Sources:**
- ✅ **16 API/RSS sources** (100% reliable, ~1500+ jobs)
- ✅ **1 HTML source** (posaohr - Croatia)
- ❌ **8 HTML sources** (broken, need fixing)

**Recommendation:** Focus on `--remote` flag for stable job flow!

---

## 📚 All Commands

### Simple Wrapper (Recommended)

```bash
# Test run (no save)
python scrape.py --test --limit 10

# Remote jobs only (best!)
python scrape.py --remote --limit 200

# Balkan jobs only
python scrape.py --balkan --limit 100

# All sources
python scrape.py --limit 200

# Load to database
python scrape.py --load

# Check database counts
python scrape.py --check
```

### Advanced (Direct Runner)

```bash
# List all sources
python runner.py --list-sources

# Scrape specific source
python runner.py --source remoteok --limit 100

# Multiple sources
python runner.py --source remoteok --source jobicy --limit 50

# Remote only, no file save
python runner.py --remote-only --no-save

# Include disabled sources
python runner.py --include-disabled --limit 50
```

---

## 🔧 Configuration

### Environment Variables

Create `scraper/.env` or use `../.env.local`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

### Source Configuration

Edit `config/jobsites.yaml` to:
- Enable/disable sources
- Adjust pagination
- Fix broken selectors
- Add new sources

---

## 📁 File Structure

```
scraper/
├── scrape.py              # Simple CLI wrapper (USE THIS!)
├── runner.py              # Main scraper engine
├── load.py                # Load to Supabase
├── normalize.py           # Data normalization
├── check_db_counts.py     # Database verification
├── config/
│   └── jobsites.yaml      # Source configuration (25 sources)
├── out/
│   └── jobs.ndjson        # Scraped jobs output
├── utils/
│   ├── database.py        # Supabase client
│   ├── normalizer.py      # Field mapping
│   └── logger.py          # Logging
└── README.md              # This file
```

---

## 🎯 Working Sources (25 total, 17 enabled)

### ✅ Remote Jobs - API Sources (14 enabled)

| Source | Type | Jobs | Status |
|--------|------|------|--------|
| `remoteok` | API | ~100 | ✅ Works |
| `jobicy` | API | ~100 | ✅ Works |
| `jobicy_junior` | API | ~50 | ✅ Works |
| `greenhouse_gitlab` | API | ~50 | ✅ Works |
| `greenhouse_automattic` | API | ~0 | ⚠️ Empty |
| `greenhouse_canonical` | API | ~50 | ✅ Works |
| `greenhouse_remotecom` | API | ~50 | ✅ Works |
| `greenhouse_mozilla` | API | ~50 | ✅ Works |
| `greenhouse_bitgo` | API | ~50 | ✅ Works |
| `greenhouse_mercury` | API | ~50 | ✅ Works |
| `lever_welocalize` | API | ~50 | ✅ Works |
| `lever_ro` | API | ~40 | ✅ Works |
| `recruitee_wallarm` | API | ~20 | ✅ Works |
| `recruitee_tiugo` | API | ~5 | ✅ Works |

### ✅ Remote Jobs - RSS Sources (2 enabled)

| Source | Type | Jobs | Status |
|--------|------|------|--------|
| `weworkremotely` | RSS | ~25 | ✅ Works |
| `weworkremotely_all` | RSS | ~85 | ✅ Works |

### ❌ Remote Jobs - HTML Sources (5 enabled, all broken)

| Source | Type | Jobs | Status |
|--------|------|------|--------|
| `nodesk_entry` | HTML | 0 | ❌ Broken |
| `skipthedrive_entry` | HTML | 0 | ❌ Broken |
| `remote_co_entry` | HTML | 0 | ❌ Broken |
| `working_nomads` | HTML | 0 | ❌ Broken |
| `support_driven` | HTML | 0 | ❌ Broken |

### 🌍 Balkan Jobs - HTML/NextJS (4 enabled, 1 works)

| Source | Country | Type | Jobs | Status |
|--------|---------|------|------|--------|
| `posaohr` | 🇭🇷 Croatia | HTML | ~200 | ✅ Works |
| `infostud` | 🇷🇸 Serbia | NextJS | 0 | ❌ Broken |
| `mojposao` | 🇭🇷 Croatia | HTML | 0 | ❌ Broken |
| `mojedelo` | 🇸🇮 Slovenia | HTML | 0 | ❌ Broken |

---

## 🔄 Data Flow

```
┌─────────────────┐
│  1. SCRAPE      │  python scrape.py --remote --limit 200
│  (runner.py)    │  → Fetches from 16 API/RSS sources
└────────┬────────┘  → Normalizes data
         │           → Deduplicates by stable_key
         ↓           → Saves to out/jobs.ndjson
┌─────────────────┐
│  out/jobs.ndjson│  632 jobs (NDJSON format, one JSON per line)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  2. LOAD        │  python scrape.py --load
│  (load.py)      │  → Connects to Supabase
└────────┬────────┘  → Splits remote/hybrid jobs
         │           → Upserts to jobs/hybrid_jobs tables
         │           → Uses stable_key for deduplication
         ↓
┌─────────────────┐
│  3. VERIFY      │  python scrape.py --check
│  (check_db_counts)│  → Shows job counts by table
└─────────────────┘  → Shows sources breakdown
```

---

## 🏆 Best Practices

### Daily Production Run

```bash
#!/bin/bash
# daily_scrape.sh

cd /path/to/scraper

# 1. Scrape remote jobs (reliable)
python scrape.py --remote --limit 200
# Expect: 600-800 jobs from API/RSS

# 2. Load to Supabase
python scrape.py --load
# Expect: ~500 new, ~300 duplicates skipped

# 3. Verify
python scrape.py --check
# Check: jobs table should grow by ~500

echo "Done! Fresh jobs loaded to RemoteBalkan.com"
```

**Schedule with cron:**
```cron
# Run daily at 6 AM
0 6 * * * cd /path/to/scraper && ./daily_scrape.sh >> logs/scraper.log 2>&1
```

### Test Before Production

```bash
# Always test first!
python scrape.py --test --limit 10

# Review output
cat out/jobs.ndjson | head -n 3

# If looks good, run full scrape
python scrape.py --remote --limit 200 && python scrape.py --load
```

---

## 🐛 Troubleshooting

### No Jobs Scraped

**Problem:** `0 jobs scraped from all sources`

**Causes:**
- Network issues
- Rate limiting
- Website structure changed (HTML sources)

**Solutions:**
```bash
# 1. Test individual source
python runner.py --source remoteok --limit 5 --no-save

# 2. Check if API is accessible
curl https://remoteok.com/api | head

# 3. Use only reliable sources
python scrape.py --remote --limit 100  # Skip HTML sources
```

### Database Connection Failed

**Problem:** `Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`

**Solution:**
```bash
# Check .env file exists
ls -la scraper/.env

# Or use parent .env.local
ls -la .env.local

# Verify credentials
cat scraper/.env | grep SUPABASE
```

### Encoding Errors (Windows)

**Problem:** `UnicodeEncodeError: 'charmap' codec can't encode...`

**Solution:** ✅ Already fixed! All emoji replaced with `[TAG]` format.

### Duplicate Jobs

**Problem:** Too many duplicates being skipped

**Cause:** `stable_key` deduplication working correctly (this is good!)

**How it works:**
- Each job gets unique `stable_key` = hash(source + url + title + company)
- Upsert with `on_conflict='stable_key'` prevents duplicates
- This is **expected behavior**

---

## 🔍 Debugging

### Check What's Working

```bash
# List all sources with status
python runner.py --list-sources

# Test each source type
python runner.py --source remoteok --limit 3 --no-save  # API
python runner.py --source weworkremotely --limit 3 --no-save  # RSS
python runner.py --source posaohr --limit 3 --no-save  # HTML
```

### Analyze Output

```bash
# View scraped jobs
cat out/jobs.ndjson | jq .  # If you have jq installed

# Count by source
cat out/jobs.ndjson | jq -r '.source_id' | sort | uniq -c

# Check specific fields
cat out/jobs.ndjson | jq '{title, company, source_id}' | head
```

### Enable Disabled Sources

```bash
# Some sources are disabled by default (broken/rate-limited)
python runner.py --include-disabled --limit 10 --no-save

# Or edit config/jobsites.yaml:
# - id: source_name
#   enabled: false  # Change to true
```

---

## 📝 Adding New Sources

### 1. Add to config/jobsites.yaml

```yaml
- id: my_new_source
  enabled: true
  kind: api  # or rss, html, nextjs
  url: https://api.example.com/jobs
  mapping:
    list_path: "jobs"
    fields:
      external_id: "id"
      title: "position"
      company: "company_name"
      url: "apply_url"
      posted_at: "date"
  derive:
    remote_type: "REMOTE"
    region: "GLOBAL"
```

### 2. Test it

```bash
python runner.py --source my_new_source --limit 5 --no-save
```

### 3. Add to documentation

Update this README with the new source stats.

---

## 📖 Additional Documentation

- **[QUICK_COMMANDS.md](QUICK_COMMANDS.md)** - Cheat sheet for common tasks
- **[USAGE.md](USAGE.md)** - Detailed usage guide
- **[README_SIMPLE.md](README_SIMPLE.md)** - Serbian language quick start

---

## 🚀 Deployment Options

### Option 1: Manual Run (Current)

Run locally whenever you need fresh jobs:
```bash
python scrape.py --remote --limit 200 && python scrape.py --load
```

### Option 2: Cron Job (Linux/Mac)

```bash
# Edit crontab
crontab -e

# Add daily run at 6 AM
0 6 * * * cd /path/to/scraper && python scrape.py --remote --limit 200 && python scrape.py --load
```

### Option 3: Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: Daily at 6:00 AM
4. Action: Start a program
   - Program: `python`
   - Arguments: `scrape.py --remote --limit 200`
   - Start in: `D:\ProjektiApp\remotebalkan\scraper`

### Option 4: Vercel Cron (Requires API)

*Would need to create API endpoint wrapper - ask if needed!*

### Option 5: GitHub Actions

*Would need to create workflow YAML - ask if needed!*

---

## 🔐 CLI Access Setup

If you want me to configure automated deployment with Vercel/Supabase CLI:

### Vercel CLI Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

### Supabase CLI Setup
```bash
# Install Supabase CLI
npm i -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

**Note:** Let me know if you want me to set this up with your credentials!

---

## 📊 Performance

**Test Run Results (limit 50):**
- Sources scanned: 25
- Time: ~60 seconds
- Jobs found: 632
- Success rate: 64% (16/25 sources working)

**Full Run Results (limit 200):**
- Expected jobs: 1,500-2,000
- Time: ~2-3 minutes
- Success rate: API/RSS sources 100%, HTML sources ~10%

---

## 🤝 Contributing

To fix broken HTML sources:

1. Check analyze scripts:
   - `analyze_infostud.py`
   - `analyze_mojposao.py`
   - etc.

2. Update selectors in `config/jobsites.yaml`

3. Test:
   ```bash
   python runner.py --source infostud --limit 5 --no-save
   ```

4. Submit PR or update directly

---

## 📄 License

MIT License - RemoteBalkan Team © 2025

---

## 🆘 Support

**Need help?**
- Check `QUICK_COMMANDS.md` for common tasks
- Review existing `analyze_*.py` scripts for debugging examples
- Test with `--test` flag before full runs
- Use `--remote` for most reliable results

**Want automated deployment?**
- Ask about Vercel Cron setup
- Ask about GitHub Actions workflow
- Ask about Railway/Render scheduled tasks

---

**Last Updated:** October 15, 2025  
**Version:** 2.0 - Unified Scraper System  
**Status:** ✅ Production Ready (Remote Jobs), ⚠️ Balkan Jobs Need Fixing
