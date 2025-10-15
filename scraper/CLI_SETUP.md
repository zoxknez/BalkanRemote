# CLI Setup za Automated Deployment

Ako želiš da setup-ujem automatizovano scraping sa Vercel Cron ili GitHub Actions, evo šta mi treba:

## 🔐 Credentials Needed

### 1. Vercel CLI Access (Opciono)

```bash
# Način 1: Login lokalno (ti radiš)
npm i -g vercel
vercel login
vercel link

# Način 2: Access Token (daš mi)
# Settings → Tokens → Create Token
VERCEL_TOKEN=your_token_here
```

**Šta mogu sa ovim:**
- Deploy scraper kao Vercel Function
- Setup Vercel Cron (free plan allows 1 cron job)
- Auto-scrape svaki dan u određeno vreme

---

### 2. Supabase CLI Access (Opciono)

```bash
# Način 1: Login lokalno (ti radiš)
npm i -g supabase
supabase login
supabase link --project-ref your-ref

# Način 2: Service Role Key (već imaš)
# Settings → API → service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

**Šta mogu sa ovim:**
- Run migrations
- Setup database functions
- Manage tables

---

## 🚀 Deployment Options

### Option A: Vercel Cron (Preporučeno za Auto-Scraping)

**Setup:**
1. Kreiram API route: `/api/scrape-jobs`
2. Konfiguriram `vercel.json` sa cron schedulom
3. Deploy sa `vercel --prod`

**vercel.json:**
```json
{
  "crons": [{
    "path": "/api/scrape-jobs",
    "schedule": "0 6 * * *"
  }]
}
```

**Rezultat:**
- ✅ Auto-scrape svaki dan u 6 AM
- ✅ Direktno load u Supabase
- ✅ Free na Hobby plan (1 cron job)

**Šta mi treba:**
- Vercel login ili token
- Potvrda da želiš ovu opciju

---

### Option B: GitHub Actions (Alternative)

**Setup:**
1. Kreiram `.github/workflows/scrape-jobs.yml`
2. Dodajem secrets u GitHub repo
3. Auto-run na schedule

**scrape-jobs.yml:**
```yaml
name: Scrape Jobs
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r scraper/requirements.txt
      - run: cd scraper && python scrape.py --remote --limit 200 && python scrape.py --load
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

**Rezultat:**
- ✅ Auto-scrape svaki dan
- ✅ Free (GitHub Actions 2000 min/month)
- ✅ Easy monitoring u Actions tab

**Šta mi treba:**
- GitHub repo access (push kod)
- Dodaj secrets u repo settings

---

### Option C: Railway.app / Render.com Cron

**Setup:**
1. Kreiram `cron-job.sh` script
2. Deploy kao Cron Job na Railway/Render
3. Auto-run daily

**Rezultat:**
- ✅ Dedicated cron runner
- ⚠️ Paid ($5-10/month)

---

## 🎯 Moja Preporuka

**Za tvoj use case (manualno + opciono auto):**

### Setup 1: GitHub Actions (Najbolje!)

**Pros:**
- ✅ Free
- ✅ Easy setup
- ✅ Dobar monitoring
- ✅ Može i manual trigger
- ✅ Ne traži Vercel Pro

**Cons:**
- Nema (sve je dobro!)

**Setup koraci:**
1. Dam ti `.github/workflows/scrape-jobs.yml` fajl
2. Ti push-uješ na GitHub
3. Dodaš secrets u repo settings:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. ✅ Done! Auto-scrape svaki dan + manual kada god hoćeš

---

### Setup 2: Samo Manualno (Trenutno)

**Pros:**
- ✅ Već radi!
- ✅ Puna kontrola
- ✅ Nema troškova

**Cons:**
- Moraš ručno pokretati

**Kako radiš:**
```bash
# Kada god hoćeš fresh jobs
cd scraper
python scrape.py --remote --limit 200 && python scrape.py --load
```

---

## 🤔 Šta biraš?

**Opcija 1: GitHub Actions (Auto + Manual)**
→ Daću ti workflow fajl, ti push-uješ i dodaš secrets

**Opcija 2: Manualno (Trenutno rešenje)**  
→ Ništa se ne menja, pokrećeš kad hoćeš

**Opcija 3: Vercel Cron**  
→ Treba mi login ili token

**Opcija 4: Railway/Render**  
→ Setup za paid plan

---

## 📝 Sledeći Koraci (ako biraš GitHub Actions)

1. Kreiram `.github/workflows/scrape-jobs.yml`
2. Commit + push na tvoj repo
3. Ideš u GitHub:
   - Settings → Secrets → New repository secret
   - Dodaš `SUPABASE_URL`
   - Dodaš `SUPABASE_SERVICE_ROLE_KEY`
4. Test manual trigger:
   - Actions → Scrape Jobs → Run workflow
5. ✅ Radi! Od sutra auto-scrape svaki dan u 6 AM

**Hoćeš ovo?** Javi mi pa završim setup! 🚀

---

## 🔧 Already Working

- ✅ Scraper system perfektno radi
- ✅ Load u Supabase radi
- ✅ 1,821 poslova u bazi
- ✅ Komande jednostavne: `python scrape.py --remote --limit 200`

**Sada odluči:** Auto ili Manual? 😊

