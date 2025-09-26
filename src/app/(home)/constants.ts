import { Building2, BookOpen, Wrench, Globe2, Zap, Gauge, Briefcase } from 'lucide-react'

export const stats = [
  { value: '200K+', label: 'Remote radnika', sub: 'Aktivnih na Balkanu' },
  { value: '250+', label: 'IT kompanija', sub: 'Zapošljava remote iz regiona' },
  { value: '15+', label: 'Praktičnih vodiča', sub: 'Za poreze, banke i alate' },
  { value: '6', label: 'Balkanske zemlje', sub: 'Srbija, Hrvatska, BiH, CG, Albanija, Severna Makedonija' },
] as const

// Napomena: ranije su ovde bili definisani tabovi za početnu stranicu.
// Kako su ti segmenti uklonjeni sa Home-a, zadržavamo samo sadržaje
// koji se i dalje koriste (heroHighlights, stats, valueProps, balkanHighlights).

export const balkanHighlights = [
  {
    title: 'Poreski vodič (porezi i modeli)',
    description:
      'Izračunaj i razumi neto/bruto, poreze i doprinose po državama na Balkanu.',
    href: '/poreski-vodic',
    icon: Gauge,
    badge: 'BALKAN',
    gradient: 'from-green-500 via-emerald-500 to-teal-600',
  },
  {
    title: 'Remote Work Saveti',
    description:
      'Praktični vodič: od registracije paušala do nalaženja klijenata iz EU i USA.',
    href: '/saveti',
    icon: BookOpen,
    badge: 'SAVETI',
    gradient: 'from-blue-500 via-purple-500 to-indigo-600',
  },
  {
    title: 'Poslovi (prečice i platforme)',
    description:
      'LinkedIn pretrage, EU remote board-ovi i freelance/vetted platforme na jednom mestu.',
    href: '/poslovi',
    icon: Briefcase,
    badge: 'POSLOVI',
    gradient: 'from-indigo-500 via-fuchsia-500 to-rose-600',
  },
] as const

export const heroHighlights = [
  { icon: Globe2, label: 'Remote iz Balkana', pulse: true },
  { icon: Zap, label: 'Praktični saveti i alati', pulse: false },
  { icon: Building2, label: 'Lokalne i globalne firme', pulse: false },
] as const

export const valueProps = [
  {
    icon: Globe2,
    title: 'Remote Rad za Balkance',
    description:
      'Sveobuhvatan vodič za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije — od registracije do prvog klijenta.',
    points: [
      'Registracija paušala i DOO-a',
      'Devizni računi i međunarodna plaćanja',
      'Poreski saveti za sve balkanske zemlje',
    ],
    glow: 'from-green-400 to-emerald-600',
  },
  {
    icon: Building2,
    title: 'IT Kompanije na Balkanu',
    description:
      'Baza balkanskih i međunarodnih IT kompanija koje aktivno zapošljavaju remote talente iz našeg regiona.',
    points: [
      'Lokalne IT firme i startup scene',
      'Globalne kompanije sa balkanskim timovima',
      'Salary benchmarks i benefits',
    ],
    glow: 'from-blue-400 to-indigo-600',
  },
  {
    icon: Wrench,
    title: 'Praktični Alati i Kalkulatori',
    description:
      'Kolekcija alata i kalkulatora prilagođenih balkanskim remote radnicima — od salary kalkulatora do Poreskog vodiča.',
    points: ['Salary & tax kalkulator za 4 zemlje', 'Setup guide za home office', 'Banking i payment solutions'],
    glow: 'from-purple-400 to-pink-600',
  },
] as const

// TAB_IDS i tipovi vezani za home tabove su uklonjeni kao neiskorišćeni.
