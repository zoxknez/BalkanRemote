# RemoteBalkan Scraper - Jednostavno Pokretanje

## ⚡ Brzi Start (3 komande)

```bash
# 1. Setup
cd scraper
pip install -r requirements.txt

# 2. Scrape poslove
python scrape.py --remote --limit 100

# 3. Učitaj u bazu
python scrape.py --load
```

✅ Gotovo!

---

## 📋 Sve Komande

```bash
# Test (bez snimanja)
python scrape.py --test --limit 10

# Remote poslovi (international)
python scrape.py --remote --limit 200

# Balkan poslovi
python scrape.py --balkan --limit 100

# Sve (remote + balkan)
python scrape.py --limit 200

# Učitaj u Supabase
python scrape.py --load

# Proveri stanje baze
python scrape.py --check
```

---

## 🔑 Konfiguracija (.env)

Kreiraj `scraper/.env` ili koristi `../.env.local`:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
```

---

## 📊 Trenutno Stanje

**Baza podataka:**
- Remote jobs: 1,595 poslova ✅
- Balkan jobs: 55 poslova ⚠️

**Izvori koji rade:**
- ✅ 18 remote izvora (API/RSS) - 100% pouzdani
- ✅ 1 balkan izvor (posaohr) - radi odlično
- ❌ 3 balkan izvora - trebaju popravku

**Preporuka:** Fokusiraj se na remote poslove, oni su stabilni!

---

## 🎯 Dnevno Pokretanje

```bash
# Ujutru (jednom dnevno)
cd scraper

# 1. Scrape sve
python scrape.py --limit 200

# 2. Load u bazu
python scrape.py --load

# 3. Check
python scrape.py --check
```

Ili sve u jednoj liniji:
```bash
python scrape.py --limit 200 && python scrape.py --load && python scrape.py --check
```

---

## 📁 Fajlovi

```
scraper/
├── scrape.py           ← 👈 KORISTI OVO (jednostavno)
├── runner.py           ← Glavni scraper (advanced)
├── load.py             ← Load u Supabase
├── check_db_counts.py  ← Provera baze
├── config/
│   └── jobsites.yaml   ← Konfiguracija izvora
└── out/
    └── jobs.ndjson     ← Scraped jobs (JSON)
```

---

## 🐛 Problem?

```bash
# Ako nešto ne radi, proveri:
python scrape.py --test --limit 5  # Test sa 5 poslova
python scrape.py --check           # Proveri bazu
```

**Česti problemi:**
- "Missing credentials" → Dodaj `.env` fajl
- "0 jobs scraped" → HTML izvori često ne rade (normalno)
- "Encoding error" → Već popravljeno!

---

Sve jasno? Javi ako zatreba pomoć! 🚀

