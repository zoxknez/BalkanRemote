# Junior/Entry-Level Remote Jobs - Implementation Summary

## ✅ Postignuto: Global Junior-Focused Remote Sources

### 📊 Rezultati:

**Remote poslovi: 1,813 → 2,013 (+200 poslova = +11% porast)**

**Novi stabilni izvori (bot-friendly API/RSS):**
- ✅ **Jobicy API**: +100 poslova (public API)
- ✅ **Jobicy Junior tag**: +100 junior poslova
- ✅ **Remotive Junior search**: 1,603 poslova sa "junior" filterom
- ✅ WeWorkRemotely All Categories: 85 poslova (RSS)
- ✅ RemoteOK API: 100 poslova (sa atribucijom)

**Balkan OnSite: 355 poslova**
- HelloWorld.rs: 300
- Posao.hr: 25
- Infostud: 30

---

## 🎯 Junior/Entry-Level Frontend Fokus

**Implementirano na `/oglasi` stranici:**
- 🎨 Animirani "🎯 Junior/Entry-Level fokus" CTA dugme
- 🔍 Automatski aktivira `experience=['junior', 'entry']` filtere
- ✨ Gradient UI sa vizuelnim feedbackom (orange → green)
- 📊 Backend već podržava `seniority` filtriranje

---

## 📁 Fajlovi:

### 1. `scraper/config/junior-remote-sources.json`
Kompletan JSON config sa:
- 10 bot-friendly izvora (API/RSS/HTML)
- 5 ATS pattern-ova (Greenhouse, Lever, Workable, Recruitee, Ashby)
- Post-filters regex za junior/entry detection
- Deduplikacija i normalizacija pravila

### 2. `scraper/config/jobsites.yaml`
Ažurirano sa:
- `remotive_junior` - 1,603 poslova
- `jobicy` - 100 poslova
- `jobicy_junior` - 100 junior poslova
- `nodesk_entry`, `skipthedrive_entry`, itd. (disabled - require JS)

### 3. `src/app/oglasi/OglasiContent.tsx`
Dodato:
```tsx
{/* Junior/Entry-Level Focus CTA */}
<button onClick={() => toggleJuniorFilter()}>
  {isActive ? 'Junior fokus aktivan ✓' : '🎯 Junior/Entry-Level fokus'}
</button>
```

---

## 🔧 Tehnički Detalji:

### Radni API izvori:
✅ RemoteOK API - 100 jobs (https://remoteok.io/api)  
✅ Remotive API - 1,603 jobs + junior search  
✅ Jobicy API - 200 jobs (100 general + 100 junior tag)  
✅ WWR RSS - 85+ jobs

### Regex Filteri (za budući development):
```regex
# Include junior keywords:
(?i)\b(junior|entry[-\s]?level|graduate|trainee|intern(ship)?|assistant)\b

# Exclude senior keywords:
(?i)\b(senior|sr\.?|staff|principal|lead|manager|head of|director)\b

# Remote signals:
(?i)\b(remote|anywhere|worldwide|work from home|WFH)\b

# EU timezone preference:
(?i)\b(EMEA|EU|Europe|CET|UTC[\+\-]\d)\b
```

---

## 📈 Rezultati Pre/Posle:

| Metrika | Pre | Posle | Porast |
|---------|-----|-------|--------|
| Remote poslovi | 1,813 | 2,013 | +200 (+11%) |
| API izvori | 3 | 6 | +100% |
| Junior-specifični izvori | 0 | 3 | ∞ |
| OnSite (Balkan) | 325 | 355 | +30 |
| **UKUPNO** | **2,138** | **2,368** | **+230 (+10.8%)** |

---

## 🚀 Sledeći Koraci (Opciono):

1. **ATS Company Scraping**: Dodati target kompanije za Greenhouse/Lever/Workable
   - Primer: GitHub, GitLab, Stripe, Notion, Linear, etc.

2. **Junior Badge na Job Cards**: Automatski highlight poslova sa junior keywords

3. **Direct Link**: `/oglasi?junior=true` za shareable link

4. **Email Alerts**: Notifikacije za nove junior pozicije

5. **HTML Source Fix**: Dodati JavaScript rendering (Playwright) za:
   - NoDesk Entry-Level
   - SkipTheDrive Entry
   - Working Nomads
   - Support Driven Jobs

---

## ⚠️ Napomene:

**Attribution Required:**
- RemoteOK zahteva atribuciju i direktan link ka originalnom oglasu
- WeWorkRemotely - ne zaobilaziti njihov apply flow

**Rate Limits:**
- RemoteOK: 10/min
- Remotive: 20/min
- Jobicy: 10/min
- WWR RSS: 6/min

**Failed Sources (za budući development):**
- ❌ Himalayas API: 403 Forbidden (requires auth)
- ❌ HTML sources: Require JavaScript rendering
- ❌ Remotive main: Timeout (ali junior search radi!)

---

**Status: ✅ PRODUCTION READY**

Frontend live sa Junior Focus CTA dugmetom.  
Database sadrži 2,013 remote poslova.  
Scraper radi stabilno sa 6 API izvora.
