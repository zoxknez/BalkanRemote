'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Users,
  Monitor,
  CheckCircle,
  ArrowRight,
  Globe,
  AlertCircle,
  FileText,
  CreditCard,
  MapPin,
  Clock,
  Shield,
  Briefcase,
  Target,
} from 'lucide-react';

interface BalkanTip {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  category: 'legal' | 'banking' | 'career' | 'tools' | 'networking' | 'lifestyle';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  country?: string;
  timeToRead: string;
  tips: string[];
  resources?: { name: string; url: string }[];
  warning?: string;
}

interface Category {
  id: 'all' | BalkanTip['category'];
  name: string;
  icon: LucideIcon;
  color: string;
}

const categories: Category[] = [
  { id: 'all', name: 'Sve kategorije', icon: Target, color: 'blue' },
  { id: 'legal', name: 'Pravno & Porezi', icon: FileText, color: 'green' },
  { id: 'banking', name: 'Banke & Plaćanja', icon: CreditCard, color: 'purple' },
  { id: 'career', name: 'Karijera & CV', icon: Briefcase, color: 'orange' },
  { id: 'tools', name: 'Alati & Setup', icon: Monitor, color: 'cyan' },
  { id: 'networking', name: 'Mreža & Klijenti', icon: Users, color: 'pink' },
  { id: 'lifestyle', name: 'Lifestyle & Balans', icon: Globe, color: 'indigo' },
];

const difficultyColors: Record<BalkanTip['difficulty'], string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const balkanTips: BalkanTip[] = [
  {
    id: 'pausal-registracija',
    icon: FileText,
    title: 'Registracija paušala u Srbiji – korak po korak',
    description: 'Kompletan vodič za registraciju paušalnog oporezivanja za remote rad.',
    category: 'legal',
    difficulty: 'beginner',
    country: 'Srbija',
    timeToRead: '8 min',
    tips: [
      'Pripremi ličnu kartu i idi na eAPR (apr.gov.rs).',
      'Odaberi šifru delatnosti 62.01 (Računarsko programiranje).',
      'Popuni prijavu za paušalno oporezivanje (Grupa II).',
      'Plati taksu online ili u banci.',
      'Sačekaj rešenje (1–3 dana) i otvori poslovni račun.',
      'Prijavi se u registre u propisanom roku.',
      'Traži feedback redovno.',
    ],
    resources: [
      { name: 'APR', url: 'https://www.apr.gov.rs' },
      { name: 'Poreska uprava – Paušal', url: 'https://www.purs.gov.rs/sr/preduzetnik/pausalno-oporezivanje.html' },
    ],
    warning: 'Limit (primer) ~8.5M RSD godišnje – proveri aktuelne pragove.',
  },
  {
    id: 'rs-dokumenta-obrasci',
    icon: FileText,
    title: 'Srbija – ključna dokumenta i obrasci',
    description: 'Gde i kako podnosiš poreske prijave, eFakture i registracije.',
    category: 'legal',
    difficulty: 'beginner',
    country: 'Srbija',
    timeToRead: '6 min',
    tips: [
      'ePorezi portal za prijave i uplate.',
      'APR e-registracija za preduzetnika/DOO.',
      'eFaktura obavezna za domaći B2B promet (ne i za strane klijente).',
      'Čuvaj ugovore i priloge (Ponude/PO) kao dokaz posla.',
    ],
    resources: [
      { name: 'ePorezi', url: 'https://eporezi.purs.gov.rs' },
      { name: 'APR', url: 'https://www.apr.gov.rs' },
      { name: 'eFaktura', url: 'https://efaktura.gov.rs' },
    ],
    warning: 'Rokovi za prijave i PDV pragovi se menjaju – prati zvanične objave.',
  },
  {
    id: 'hr-dokumenta-obrasci',
    icon: FileText,
    title: 'Hrvatska – ePorezna, FINA i HOK',
    description: 'Osnovni servisi i šta ti treba za paušalni obrt ili obrt s knjigama.',
    category: 'legal',
    difficulty: 'beginner',
    country: 'Hrvatska',
    timeToRead: '5 min',
    tips: [
      'ePorezna za prijave i porezne obveze.',
      'FINA e-Račun i servisi.',
      'HOK informacije za obrtnike (paušalni razredi).',
    ],
    resources: [
      { name: 'ePorezna', url: 'https://e-porezna.porezna-uprava.hr' },
      { name: 'FINA', url: 'https://www.fina.hr' },
      { name: 'HOK', url: 'https://www.hok.hr' },
    ],
  },
  {
    id: 'bih-dokumenta-obrasci',
    icon: FileText,
    title: 'BiH – UINO/FBiH/RS portali',
    description: 'Razlike po entitetima: PDV (UINO), porezi FBiH i RS.',
    category: 'legal',
    difficulty: 'intermediate',
    country: 'BiH',
    timeToRead: '7 min',
    tips: [
      'UINO za PDV procedure i pragove.',
      'Porezna uprava FBiH – propisi i obrasci.',
      'Poreska uprava RS – propisi i obrasci.',
    ],
    resources: [
      { name: 'UINO', url: 'https://www.uino.gov.ba' },
      { name: 'Porezna uprava FBiH', url: 'https://www.pufbih.ba' },
      { name: 'Poreska uprava RS', url: 'https://www.poreskaupravars.org' },
    ],
  },
  {
    id: 'cg-dokumenta-obrasci',
    icon: FileText,
    title: 'Crna Gora – Poreska uprava i e-servisi',
    description: 'Gde da pratiš doprinose, PDV prag i registracije.',
    category: 'legal',
    difficulty: 'beginner',
    country: 'Crna Gora',
    timeToRead: '5 min',
    tips: [
      'Portal Poreske uprave CG za prijave.',
      'Prati lokalne odluke opština (paušal/forfetar).',
      'Korišćenje e-servisa gde je dostupno.',
    ],
    resources: [
      { name: 'Poreska uprava CG', url: 'https://www.poreskauprava.gov.me' },
      { name: 'CBCG', url: 'https://www.cbcg.me' },
      { name: 'Vlada CG', url: 'https://www.gov.me' },
    ],
  },
  {
    id: 'devizni-racun',
    icon: CreditCard,
    title: 'Devizni račun za freelancere',
    description: 'Kako otvoriti devizni račun i primati USD/EUR iz inostranstva.',
    category: 'banking',
    difficulty: 'intermediate',
    timeToRead: '10 min',
    tips: [
      'Proveri uslove banaka za poslovne devizne račune.',
      'Potrebno: lična karta, rešenje, ugovori/računi.',
      'Payoneer/Wise kao međukorak (prijavljivanje priliva).',
      'Redovno usklađivanje deviznih priliva (lokalna pravila).',
      'Konverzija u lokalnu valutu po potrebi.',
    ],
    resources: [
      { name: 'NBS', url: 'https://www.nbs.rs' },
      { name: 'Payoneer', url: 'https://www.payoneer.com/sr/' },
      { name: 'Wise', url: 'https://wise.com/sr/' },
    ],
  },
  {
    id: 'sigurnost-radnog-okruzenja',
    icon: Shield,
    title: 'Bezbednost i pravna zaštita',
    description: 'Kako da zaštitiš sebe, klijente i podatke tokom remote rada.',
    category: 'tools',
    difficulty: 'intermediate',
    timeToRead: '9 min',
    tips: [
      '2FA na svim važnim nalozima (email, banke, GitHub).',
      'Password manager (Bitwarden/1Password) i jedinstvene lozinke.',
      'Redovni backup (cloud + lokalni disk).',
      'Potpiši NDA kad radiš sa osetljivim podacima.',
      'Ugovori sa klauzulom o intelektualnoj svojini i raskidu.',
    ],
    resources: [
      { name: 'Bitwarden', url: 'https://bitwarden.com' },
      { name: '1Password', url: 'https://1password.com' },
      { name: 'Dropbox Sign (NDA templates)', url: 'https://www.hellosign.com/templates' },
    ],
  },
  {
    id: 'portfolio-case-studies',
    icon: Briefcase,
    title: 'Portfolio koji prodaje – case studies',
    description: 'Struktura 1–2 stranice koja uveri klijenta za 5 minuta.',
    category: 'career',
    difficulty: 'beginner',
    timeToRead: '7 min',
    tips: [
      'Problem → Rešenje → Rezultat (brojevi, pre/posle).',
      'Kratki video demo (loom) umesto 10 slika.',
      'Linkuj kod/PR-ove gde je moguće.',
      'CTA: “Spreman za 1h besplatnog konsultinga”.',
    ],
    resources: [
      { name: 'Loom', url: 'https://www.loom.com' },
      { name: 'Read.cv', url: 'https://read.cv' },
      { name: 'GitHub Pages', url: 'https://pages.github.com' },
    ],
  },
  {
    id: 'outreach-sabloni',
    icon: Users,
    title: 'Outreach šabloni za LinkedIn/Email',
    description: 'Personalizovane poruke koje dobijaju odgovor.',
    category: 'networking',
    difficulty: 'advanced',
    timeToRead: '10 min',
    tips: [
      '3 rečenice max: povod, vrednost, poziv na kratak call.',
      'Personalizuj 1–2 detalja (repo, post, proizvod).',
      'Traži uvod putem zajedničkog kontakta.',
      'Pošalji follow-up za 3–5 dana (max 2 puta).',
    ],
    resources: [
      { name: 'Hunter', url: 'https://hunter.io' },
      { name: 'Apollo', url: 'https://www.apollo.io' },
      { name: 'LinkedIn', url: 'https://www.linkedin.com' },
    ],
  },
  {
    id: 'work-life-balance-remote',
    icon: Globe,
    title: 'Balans: remote rad i privatni život',
    description: 'Rutine koje sprečavaju burnout kada radiš iz kuće.',
    category: 'lifestyle',
    difficulty: 'beginner',
    timeToRead: '6 min',
    tips: [
      'Jasan kraj radnog dana i “commute” šetnja.',
      'Odvojena soba ili bar fizička granica (paravan).',
      'Dogovor sa ukućanima o fokus terminima.',
      'Trening 3x nedeljno i vitamin D/šeta.',
    ],
  },
  {
    id: 'cv-za-remote',
    icon: Briefcase,
    title: 'CV koji dobija remote posao',
    description: 'Specifičnosti CV-a za globalno tržište.',
    category: 'career',
    difficulty: 'beginner',
    timeToRead: '12 min',
    tips: [
      'Timezone na vrhu (CET).',
      'Posebna sekcija: Remote work experience.',
      'English proficiency (C1/C2).',
      '“Available for EU/US hours” ako možeš.',
      'Portfolio na engleskom (po mogućnosti .com).',
      'LinkedIn na engleskom.',
    ],
    resources: [
      { name: 'RemoteOK', url: 'https://remoteok.com' },
      { name: 'We Work Remotely', url: 'https://weworkremotely.com' },
    ],
  },
  {
    id: 'home-office-balkan',
    icon: Monitor,
    title: 'Home office – praktično',
    description: 'Setup koji radi sa našim budžetom i infrastrukturom.',
    category: 'tools',
    difficulty: 'beginner',
    timeToRead: '6 min',
    tips: [
      'Stabilan internet (optika 100+ Mbps).',
      'UPS (prekidi struje).',
      'Dobra kamera/mikrofon ili slušalice sa NC.',
      'Rezervni mobilni internet (hotspot).',
      'Udobna stolica/monitor – ergonomija.',
    ],
  },
  {
    id: 'engleski-za-tech',
    icon: Globe,
    title: 'Tehnički engleski za developere',
    description: 'Kako poboljšati komunikaciju sa klijentima i timom.',
    category: 'career',
    difficulty: 'intermediate',
    timeToRead: '7 min',
    tips: [
      'Gledaj tech kanale (npr. Fireship, Traversy).',
      'Čitaj zvaničnu dokumentaciju.',
      'Vežbaj kratke code-reviewe na engleskom.',
      'Koristi grammar pomoćnike, ali piši samostalno.',
    ],
  },
  {
    id: 'klijenti-eu-us',
    icon: Users,
    title: 'Nalaženje klijenata u EU i USA',
    description: 'Strategije za osvajanje međunarodnih klijenata.',
    category: 'networking',
    difficulty: 'advanced',
    timeToRead: '15 min',
    tips: [
      'LinkedIn outreach – 5–10 personalizovanih poruka dnevno.',
      'Upwork/Freelancer – istakni value, ne samo cenu.',
      'Cold email (Hunter/Apollo).',
      'Open-source doprinosi na GitHub-u.',
      'Niche veštine (npr. RN/AI/ML) privlače pažnju.',
      'Referral program sa postojećim klijentima.',
    ],
    resources: [
      { name: 'Apollo.io', url: 'https://www.apollo.io' },
      { name: 'Hunter.io', url: 'https://hunter.io' },
    ],
  },
  {
    id: 'timezone-management',
    icon: Clock,
    title: 'Rad sa različitim timezone-ovima',
    description: 'Kako efikasno raditi sa USA/EU/Asia klijentima.',
    category: 'lifestyle',
    difficulty: 'intermediate',
    timeToRead: '9 min',
    tips: [
      'Google Calendar multi-timezone.',
      'Core hours dogovori unapred.',
      'Asinhrona komunikacija gde je moguće.',
      'Za US Pacific planiraj kasne termine ili asinhrono.',
    ],
  },
  {
    id: 'payoneer-wise-srbija',
    icon: CreditCard,
    title: 'Payoneer vs Wise – 2025',
    description: 'Praktični saveti za primanje novca iz inostranstva.',
    category: 'banking',
    difficulty: 'beginner',
    timeToRead: '8 min',
    tips: [
      'Payoneer – brži ACH za USA.',
      'Wise – SEPA/IBAN pogodnosti za EU.',
      'Kombinuj po klijentu/zemlji.',
      'Uvek imaj backup kanal.',
    ],
    resources: [
      { name: 'Payoneer Fees', url: 'https://www.payoneer.com/sr/fees/' },
      { name: 'Wise Pricing', url: 'https://wise.com/sr/pricing/' },
    ],
  },
  {
    id: 'porezni-saveti',
    icon: Shield,
    title: 'Poreski saveti za veće zarade',
    description: 'Šta kada prerasteš paušal i kako optimizovati.',
    category: 'legal',
    difficulty: 'advanced',
    country: 'Srbija',
    timeToRead: '12 min',
    tips: [
      'Iznad limita – razmotri preduzetnik/DOO.',
      'Priznati troškovi: oprema, internet, edukacije.',
      'Računovođa čim pređeš srednji nivo prihoda.',
      'Proveri ugovore o izbegavanju dvostrukog oporezivanja.',
    ],
    warning: 'Za velike sume – konsultuj poreskog savetnika.',
  },
  {
    id: 'networking-balkan',
    icon: Users,
    title: 'IT zajednica na Balkanu',
    description: 'Gde da se povežeš sa drugim remote radnicima.',
    category: 'networking',
    difficulty: 'beginner',
    timeToRead: '5 min',
    tips: [
      'Lokalni meetup-ovi i konferencije.',
      'Discord/FB grupe (remote/freelance).',
      'Deljenje znanja na LinkedIn-u/Twitter-u.',
    ],
  },
];

const phases = [
  {
    phase: 'Faza 1',
    title: 'Osnove i dokumenta',
    items: ['Odaberi pravni oblik', 'Pripremi lična/poslovna dokumenta', 'Otvori poslovni račun'],
  },
  {
    phase: 'Faza 2',
    title: 'Setup & alati',
    items: ['Stabilan internet/UPS', 'Task/kalendar alati', 'Bezbednost (2FA, backup)'],
  },
  {
    phase: 'Faza 3',
    title: 'CV & profil',
    items: ['Engleski CV/LinkedIn', 'Portfolio (case studies)', 'Reference/Testimonials'],
  },
  {
    phase: 'Faza 4',
    title: 'Klijenti & rast',
    items: ['Outreach & OS doprinosi', 'Asinhrona komunikacija', 'Traži feedback redovno'],
  },
];

function SavetiContent() {
  const [selectedCategory, setSelectedCategory] = useState<Category['id']>('all');
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.documentElement.style.scrollBehavior = '';
      }
    };
  }, []);

  const filteredTips = useMemo(
    () => (selectedCategory === 'all' ? balkanTips : balkanTips.filter((t) => t.category === selectedCategory)),
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
                <BookOpen className="w-12 h-12" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">Remote Work Saveti za Balkan</h1>
            <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto">
              Praktični vodič za remote rad iz Srbije, Hrvatske, BiH, Crne Gore, Albanije i Severne Makedonije – od registracije do
              prvog klijenta.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <CheckCircle className="w-4 h-4" />
                <span>Aktuelni saveti</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <MapPin className="w-4 h-4" />
                <span>6 balkanskih zemalja</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20">
                <Users className="w-4 h-4" />
                <span>Zajednica freelancera</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-[260px_1fr]">
          <aside className="bg-white rounded-xl border border-gray-200 p-4 h-fit sticky top-4 self-start">
            <button onClick={() => setTocOpen((v) => !v)} className="w-full text-left text-sm font-semibold text-gray-900 mb-3">
              Sadržaj
            </button>
            {tocOpen && (
              <nav className="text-sm text-gray-700 space-y-1">
                <a href="#quick-start" className="block hover:text-blue-600">
                  🚀 Quick Start
                </a>
                <a href="#tips" className="block hover:text-blue-600">
                  📚 Saveti po kategorijama
                </a>
                <a href="#mistakes" className="block hover:text-blue-600">
                  ⚠️ Česte greške
                </a>
                <a href="#resources" className="block hover:text-blue-600">
                  🔗 Korisni resursi
                </a>
              </nav>
            )}
          </aside>
          <div>
            <div className="mb-8">
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div id="quick-start" className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">🚀 Quick Start Guide za Remote Rad</h2>
                <p className="text-green-100">4 koraka do održive remote karijere</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {phases.map((phase, idx) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className="bg-white/10 rounded-lg p-4"
                  >
                    <h3 className="font-bold text-lg mb-1">{phase.phase}</h3>
                    <h4 className="text-green-100 text-sm font-medium mb-3">{phase.title}</h4>
                    <ul className="space-y-2">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start text-xs">
                          <CheckCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            <div id="tips" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredTips.map((tip, index) => {
                const Icon = tip.icon;
                const isOpen = expandedTip === tip.id;
                return (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${difficultyColors[tip.difficulty]}`}>
                              {tip.difficulty}
                            </span>
                            <span className="text-xs text-gray-500">{tip.timeToRead}</span>
                            {tip.country && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{tip.country}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{tip.description}</p>

                    <button
                      onClick={() => setExpandedTip(isOpen ? null : tip.id)}
                      className="text-sm text-blue-600 font-medium hover:text-blue-700 mb-3"
                    >
                      {isOpen ? 'Sakrij detalje' : 'Prikaži detalje'}
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <ul className="space-y-2 mb-3">
                            {tip.tips.map((t, i) => (
                              <li key={i} className="flex items-start text-sm">
                                <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{t}</span>
                              </li>
                            ))}
                          </ul>

                          {tip.warning && (
                            <div className="flex items-start gap-2 p-3 border rounded-lg bg-yellow-50 border-yellow-200 text-yellow-900 text-sm mb-3">
                              <AlertCircle className="w-4 h-4 mt-0.5" />
                              <span>{tip.warning}</span>
                            </div>
                          )}

                          {!!tip.resources?.length && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-semibold text-gray-900 mb-2">Resursi:</p>
                              <ul className="space-y-1">
                                {tip.resources.map((r) => (
                                  <li key={r.url}>
                                    <a
                                      className="text-sm text-indigo-600 hover:text-indigo-700"
                                      href={r.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {r.name}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <div id="mistakes" className="bg-red-50 border border-red-200 rounded-2xl p-8 mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-red-900 mb-2">⚠️ Česte greške koje treba izbegavati</h2>
                <p className="text-red-700">Učite iz tuđih grešaka</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { t: 'Generic aplikacije', s: 'Slanje istog CV-ja svima' },
                  { t: 'Loš home office', s: 'Rad iz kreveta/bez tišine' },
                  { t: 'Ignorisanje timezone', s: 'Bez napomene o dostupnosti' },
                  { t: 'Skrivanje lokacije', s: 'Obmanjivanje o geografiji' },
                  { t: 'Bez backup plana', s: 'Nema plana kad padne internet/struja' },
                  { t: 'Multitasking na pozivima', s: 'Rad na drugim stvarima tokom sastanaka' },
                ].map((x, i) => (
                  <div className="flex items-start" key={x.t}>
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-white text-xs font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-900">{x.t}</h4>
                      <p className="text-sm text-red-700">{x.s}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="resources" className="text-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Korisni resursi za dalje učenje</h2>
                <p className="text-blue-100 mb-6">Pogledaj kolekciju alata, kurseva i vodiča</p>
                <Link
                  href="/resursi"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Pogledaj resurse
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavetiContent;
