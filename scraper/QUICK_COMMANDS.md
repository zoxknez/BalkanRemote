# RemoteBalkan Scraper - Brze Komande

## 🎯 Manualno Pokretanje (Preporučeno)

### Scenario 1: Dnevni Update (Sve)
```bash
cd scraper
python scrape.py --limit 200 && python scrape.py --load && python scrape.py --check
```

### Scenario 2: Samo Remote Jobs (Najbrže, Najpouzdanije)
```bash
cd scraper
python scrape.py --remote --limit 100 && python scrape.py --load
```

### Scenario 3: Test (Bez Snimanja u Bazu)
```bash
cd scraper
python scrape.py --test --limit 10
```

---

## 📊 Trenutno Stanje (Nakon Testa)

```
[DATABASE] Job Counts:
jobs table: ~2,200+ jobs (bilo 1,595 + 632 nova)
hybrid_jobs table: 55 jobs

By source in hybrid_jobs:
  infostud: 30
  posaohr: 25
```

---

## ⚡ Sve Komande

```bash
# Setup (jednom)
cd scraper
pip install -r requirements.txt

# Scraping
python scrape.py                    # Sve izvore (remote + balkan)
python scrape.py --remote           # Samo remote (najbolje!)
python scrape.py --balkan           # Samo Balkan (manje pouzdano)
python scrape.py --test             # Test bez snimanja
python scrape.py --limit 50         # Limiti po izvoru

# Loading
python scrape.py --load             # Učitaj u Supabase
python scrape.py --check            # Proveri stanje baze

# Advanced (direktno)
python runner.py --list-sources     # Lista svih izvora
python runner.py --source remoteok --limit 100  # Jedan izvor
python runner.py --remote-only --no-save        # Samo remote, bez file-a
python load.py                      # Load direktno iz out/jobs.ndjson
```

---

## 🏆 Najbolja Praksa

**Za produkciju (dnevno):**
```bash
# 1. Ujutru
cd scraper
python scrape.py --remote --limit 200

# 2. Učitaj
python scrape.py --load

# 3. Proveri
python scrape.py --check
```

**Očekivani rezultati:**
- ✅ 600-800 remote poslova (API/RSS izvori su stabilni)
- ⚠️ 0-50 balkan poslova (HTML izvori često ne rade)
- ⏱️ Trajanje: ~1-2 min za scrape, ~5 sec za load

---

## 🔧 Debugging

```bash
# Proveri jedan izvor
python runner.py --source remoteok --limit 5 --no-save

# Lista svih izvora
python runner.py --list-sources

# Samo radne izvore (API/RSS)
python runner.py --source remoteok --source jobicy --source greenhouse_gitlab --limit 100
```

---

## 📁 Output Files

```
scraper/
├── out/
│   └── jobs.ndjson          # Scraped jobs (JSON, jedna linija po job-u)
└── .env or ../.env.local    # Credentials
```

---

## ✅ Verifikacija

Nakon load-a, proveri:
```bash
python scrape.py --check
```

Trebalo bi da vidiš:
```
[DATABASE] Job Counts:
jobs table: XXXX jobs         # Treba da raste
hybrid_jobs table: XX jobs
```

---

## 🚨 Poznati Problemi i Rešenja

**Problem:** "0 jobs scraped"
- **Uzrok:** HTML izvori se često pokvare (websites menjaju strukturu)
- **Rešenje:** Koristi `--remote` flag (samo API/RSS)

**Problem:** "Missing credentials"
- **Uzrok:** Nema `.env` fajla
- **Rešenje:** Kopiraj credentials iz `../.env.local` ili dodaj u `scraper/.env`

**Problem:** "Encoding errors"
- **Uzrok:** Windows terminal ne podržava emoji
- **Rešenje:** ✅ Već popravljeno! Svi emoji zamenjeni sa [TAG] formatom

---

## 🎓 Napredne Opcije

### Selektivno Scraping
```bash
# Samo najbolji API izvori
python runner.py \
  --source remoteok \
  --source jobicy \
  --source greenhouse_gitlab \
  --source greenhouse_mozilla \
  --limit 200
```

### Custom Pipeline
```bash
# 1. Scrape u file
python runner.py --remote-only --limit 500
# out/jobs.ndjson

# 2. Manual review/edit out/jobs.ndjson

# 3. Load to DB
python load.py
```

---

**Autor:** RemoteBalkan Team
**Verzija:** 2.0 - Unified System
**Datum:** 15. Oktobar 2025

