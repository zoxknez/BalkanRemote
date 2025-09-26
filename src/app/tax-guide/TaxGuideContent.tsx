'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Building2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/** -------------------- Types -------------------- */

type CalcMode = 'flat' | 'income' | 'company';

interface BalkanTaxOption {
  id: string;
  country: string; // npr. 'Srbija', 'Hrvatska'
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  requirements: string[];
  /** procentualna stopa poreza (npr. 10 = 10%) za income/company modove; za flat može biti 0 */
  taxRate: number;
  minIncome?: number;
  maxIncome?: number;
  /** opis doprinosa (može sadržati procente u tekstu, npr. "33% ukupno" ili "Uključeno u paušal") */
  socialContributions: string;
  bestFor: string[];
  officialLink: string;
  /** očekivani fiksni mesečni trošak (paušal, doprinosi+fiksno), u valuti zemlje */
  estimatedMonthlyCost: number;
  currency: string; // 'RSD' | 'EUR' | 'BAM' | ...
  lastUpdated: string; // ISO date 'YYYY-MM-DD'
  /** kako se računa ova opcija */
  calcMode?: CalcMode;
  /** dodatne stope (npr. dividenda za DOO) – opciono */
  extraRates?: {
    dividendTax?: number; // npr. 20 (za 20%)
  };
}

interface CountryTaxInfo {
  country: string;
  currency: string;
  minWage: number;
  avgSalary: number;
  vatThreshold: number;
  doubleTaxationTreaties: string[];
  popularBanks: string[];
  usefulLinks: string[];
}

/** -------------------- Demo FX → USD (grubo, za UI) -------------------- */
const FX_TO_USD: Record<string, number> = {
  RSD: 1 / 117, // ~ 1 USD = 117 RSD
  EUR: 1.08,    // ~ 1 EUR = 1.08 USD
  BAM: 0.55,    // ~ 1 BAM = 0.55 USD
  ALL: 1 / 92,  // ~ 1 USD = 92 ALL (aproksim.)
  MKD: 1 / 57,  // ~ 1 USD = 57 MKD (aproksim.)
};

/** -------------------- Helpers -------------------- */

const pctFromString = (txt: string, fallbackPct: number) => {
  // hvata prvi broj (može biti decimalan) i pretvara u procenat
  const m = txt.match(/(\d+(?:[.,]\d+)?)\s*%/);
  if (!m) return fallbackPct;
  const raw = m[1].replace(',', '.');
  const num = parseFloat(raw);
  return isFinite(num) ? num : fallbackPct;
};

const formatMoney = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // fallback
    return `${value.toLocaleString()} ${currency}`;
  }
};

const usdEq = (amount: number, currency: string) => {
  const fx = FX_TO_USD[currency] ?? 0;
  if (!fx) return '';
  const usd = amount * fx;
  return `~$${Math.round(usd).toLocaleString()}`;
};

/** -------------------- Podaci po zemljama (demo) -------------------- */

const balkanCountriesInfo: CountryTaxInfo[] = [
  {
    country: 'Srbija',
    currency: 'RSD',
    minWage: 50000,
    avgSalary: 95000,
    vatThreshold: 8000000,
    doubleTaxationTreaties: ['EU zemlje', 'USA', 'UK', 'Kanada', 'Australija'],
    popularBanks: ['Banca Intesa', 'Komercijalna banka', 'AIK banka', 'Raiffeisen'],
    usefulLinks: ['https://www.purs.gov.rs', 'https://www.apr.gov.rs', 'https://efaktura.gov.rs'],
  },
  {
    country: 'Hrvatska',
    currency: 'EUR',
    minWage: 700,
    avgSalary: 1100,
    vatThreshold: 40000,
    doubleTaxationTreaties: ['EU zemlje', 'USA', 'UK', 'Kanada'],
    popularBanks: ['Zagrebačka banka', 'PBZ', 'Erste banka'],
    usefulLinks: ['https://www.porezna-uprava.hr', 'https://www.hok.hr', 'https://www.fina.hr'],
  },
  {
    country: 'Bosna i Hercegovina',
    currency: 'BAM',
    minWage: 540,
    avgSalary: 1000,
    vatThreshold: 50000,
    doubleTaxationTreaties: ['EU zemlje (SAA)', 'Susedne zemlje'],
    popularBanks: ['UniCredit', 'Raiffeisen', 'NLB banka', 'Sparkasse'],
    usefulLinks: ['https://www.uino.gov.ba', 'https://www.fbih.rp.ms.gov.ba'],
  },
  {
    country: 'Crna Gora',
    currency: 'EUR',
    minWage: 450,
    avgSalary: 800,
    vatThreshold: 18000,
    doubleTaxationTreaties: ['EU zemlje', 'Balkan'],
    popularBanks: ['CKB', 'NLB banka', 'Hipotekarna banka'],
    usefulLinks: ['https://www.poreskauprava.gov.me', 'https://www.cbcg.me'],
  },
];

/** -------------------- Opcije oporezivanja po zemlji (demo) -------------------- */

const balkanTaxOptions: BalkanTaxOption[] = [
  // SRBIJA
  {
    id: 'srbija-pausal',
    country: 'Srbija',
    name: 'Paušalno oporezivanje (Grupa II)',
    description:
      'Najpopularniji model za freelancere. Fiksan mesečni iznos ~34.530 RSD (demo).',
    pros: [
      'Jednostavno vođenje evidencije',
      'Fiksni mesečni trošak – predvidljivost',
      'Brza registracija (online)',
      'Automatski PIO i zdravstvo',
    ],
    cons: [
      'Limitiran godišnji prihod',
      'Ne možeš oduzimati troškove',
      'Plaća se i kad nema prihoda',
    ],
    requirements: [
      'Delatnost 62.01 – Programiranje',
      'APR registracija',
      'Poslovni račun',
    ],
    taxRate: 0,
    maxIncome: 8_500_000,
    socialContributions: 'Uključeno u paušal',
    bestFor: ['Remote developeri (do ~60k EUR/godišnje)', 'Freelenceri', 'Početnici'],
    officialLink:
      'https://www.purs.gov.rs/sr/preduzetnik/pausalno-oporezivanje.html',
    estimatedMonthlyCost: 34_530,
    currency: 'RSD',
    lastUpdated: '2025-01-01',
    calcMode: 'flat',
  },
  {
    id: 'srbija-stvarni',
    country: 'Srbija',
    name: 'Preduzetnik – stvarni prihod',
    description:
      'Oporezivanje na stvarno ostvareni prihod. Pogodno za veće zarade i one sa troškovima.',
    pros: ['Nema limita prihoda', 'Oduzimanje troškova', 'Refundacija moguće'],
    cons: ['Kompleksnije knjige', 'Mesečni izveštaji', 'Računovođa poželjan'],
    requirements: ['APR registracija', 'Vođenje poslovnih knjiga', 'PPP/PDPO obrasci'],
    taxRate: 10,
    socialContributions: '19.9% na osnovicu (min 35% prosečne zarade)',
    bestFor: ['60k+ EUR', 'Agencije, konsultanti', 'Varijabilni prihodi'],
    officialLink: 'https://www.purs.gov.rs/sr/preduzetnik.html',
    estimatedMonthlyCost: 0, // zavisi od prihoda
    currency: 'RSD',
    lastUpdated: '2025-01-01',
    calcMode: 'income',
  },
  {
    id: 'srbija-doo',
    country: 'Srbija',
    name: 'DOO (društvo sa ograničenom odgovornošću)',
    description:
      'Za ozbiljniji biznis i timove; ograničena odgovornost, ali složenije knjigovodstvo.',
    pros: ['Ograničena odgovornost', 'Kredibilitet', 'Zapošljavanje'],
    cons: ['Složenije osnivanje', 'Fiksni troškovi', 'Duplo oporezivanje moguće'],
    requirements: ['APR registracija', 'Osnivački akt', 'Računovođa'],
    taxRate: 15, // porez na dobit (demo)
    socialContributions: '19.9% za direktora (ako je zaposlen)',
    bestFor: ['100k+ EUR/godišnje', 'Timovi', 'B2B softver'],
    officialLink: 'https://www.apr.gov.rs',
    estimatedMonthlyCost: 50_000, // fiksno knjig. + ostalo (demo)
    currency: 'RSD',
    lastUpdated: '2025-01-01',
    calcMode: 'company',
    extraRates: { dividendTax: 20 },
  },

  // HRVATSKA
  {
    id: 'hrvatska-pausal',
    country: 'Hrvatska',
    name: 'Paušalni obrt',
    description: 'Jednostavan model do ~40.000 EUR godišnje bez PDV-a.',
    pros: ['Jednostavno', 'Bez PDV do 40k EUR', 'Fiksni doprinosi'],
    cons: ['Ograničen prihod', 'Obavezni doprinosi i bez prihoda'],
    requirements: ['Registracija obrta u HOK', 'Poslovni račun'],
    taxRate: 12,
    maxIncome: 40_000,
    socialContributions: 'Od ~200 EUR mesečno',
    bestFor: ['Mali freelanceri', 'Part-time'],
    officialLink: 'https://www.hok.hr',
    estimatedMonthlyCost: 200,
    currency: 'EUR',
    lastUpdated: '2025-01-01',
    calcMode: 'flat',
  },
  {
    id: 'hrvatska-dohodak',
    country: 'Hrvatska',
    name: 'Obrt na dohodak',
    description:
      'Oporezivanje na stvarni dohodak; profesionalno za veće prihode.',
    pros: ['Nema limita prihoda', 'Troškovi se priznaju', 'EU tržište'],
    cons: ['Kompleksnije', 'Doprinosi visoki (~33%)', 'Računovođa'],
    requirements: ['HOK registracija', 'Knjigovodstvo', 'Izvještaji'],
    taxRate: 20, // do 30k 20%, iznad 30% (demo)
    socialContributions: '33% ukupno',
    bestFor: ['Etablirani freelanceri', 'Veći projekti'],
    officialLink: 'https://www.porezna-uprava.hr',
    estimatedMonthlyCost: 0,
    currency: 'EUR',
    lastUpdated: '2025-01-01',
    calcMode: 'income',
  },

  // CRNA GORA
  {
    id: 'cg-preduzetnik',
    country: 'Crna Gora',
    name: 'Preduzetnik',
    description: 'Jednostavan sistem; porez 9% (demo).',
    pros: ['Nizak porez (9%)', 'EUR valuta', 'Brza registracija'],
    cons: ['Manje tržište', 'Manje resursa'],
    requirements: ['Registracija', 'Poslovni račun', 'Mesečni izvještaji'],
    taxRate: 9,
    socialContributions: '24% (PIO 15% + Zdravstvo 9%)',
    bestFor: ['Digital nomads', 'Mali do srednji prihodi'],
    officialLink: 'https://www.poreskauprava.gov.me',
    estimatedMonthlyCost: 200,
    currency: 'EUR',
    lastUpdated: '2025-01-01',
    calcMode: 'income',
  },

  // BOSNA I HERCEGOVINA
  {
    id: 'bih-samostalna',
    country: 'Bosna i Hercegovina',
    name: 'Samostalna djelatnost',
    description:
      'Sistem varira po entitetima; ovdje su okvirni parametri za demo.',
    pros: ['Niski troškovi registracije', 'Pristupačno za početak'],
    cons: ['Različita pravila po entitetima', 'Doprinosi oko ~33%'],
    requirements: ['Registracija u sudu', 'Poreska prijava'],
    taxRate: 10,
    socialContributions: '~33% ukupno',
    bestFor: ['Lokalni projekti', 'Početnici'],
    officialLink: 'https://www.uino.gov.ba',
    estimatedMonthlyCost: 300,
    currency: 'BAM',
    lastUpdated: '2025-01-01',
    calcMode: 'income',
  },
];

/** -------------------- Kalkulacije -------------------- */

type CalcResult = {
  monthlyTaxTotal: number;
  annualTaxTotal: number;
  netAnnual: number;
  netMonthly: number;
  effectiveRatePct: number; // u %
  incomeTaxMonthly?: number;
  contributionsMonthly?: number;
};

function calcFlat(option: BalkanTaxOption, monthlyIncome: number): CalcResult {
  const monthlyFlat = option.estimatedMonthlyCost || 0;
  const netMonthly = Math.max(0, monthlyIncome - monthlyFlat);
  const effectiveRatePct = monthlyIncome > 0 ? (monthlyFlat / monthlyIncome) * 100 : 0;
  return {
    monthlyTaxTotal: monthlyFlat,
    annualTaxTotal: monthlyFlat * 12,
    netAnnual: netMonthly * 12,
    netMonthly,
    effectiveRatePct,
  };
}

function calcIncome(
  option: BalkanTaxOption,
  monthlyIncome: number,
  monthlyExpenses: number
): CalcResult {
  const monthlyTaxable = Math.max(0, monthlyIncome - monthlyExpenses);
  const taxPct = (option.taxRate || 0) / 100; // npr. 0.10
  // pokušaj da parsiramo doprinose iz stringa; fallback 0.36
  const contribPct = pctFromString(option.socialContributions ?? '', 36) / 100;
  const incomeTaxMonthly = monthlyTaxable * taxPct;
  const contributionsMonthly = monthlyTaxable * contribPct;
  const monthlyTaxTotal = incomeTaxMonthly + contributionsMonthly;
  const netMonthly = Math.max(0, monthlyIncome - monthlyTaxTotal);
  const effectiveRatePct = monthlyIncome > 0 ? (monthlyTaxTotal / monthlyIncome) * 100 : 0;
  return {
    monthlyTaxTotal,
    annualTaxTotal: monthlyTaxTotal * 12,
    netAnnual: netMonthly * 12,
    netMonthly,
    effectiveRatePct,
    incomeTaxMonthly,
    contributionsMonthly,
  };
}

function calcCompany(
  option: BalkanTaxOption,
  monthlyIncome: number,
  monthlyExpenses: number
): CalcResult {
  // vrlo uprošćeno: porez na dobit + (opciono) porez na dividendu,
  // uz pretpostavku da se ceo profit distribuira (demo).
  const monthlyProfit = Math.max(0, monthlyIncome - monthlyExpenses);
  const profitTaxPct = (option.taxRate || 0) / 100; // npr. 15%
  const dividendPct = (option.extraRates?.dividendTax ?? 0) / 100; // npr. 20%
  const profitTax = monthlyProfit * profitTaxPct;
  const dividendTax = monthlyProfit * dividendPct;
  const monthlyTaxTotal = profitTax + dividendTax + (option.estimatedMonthlyCost || 0);
  const netMonthly = Math.max(0, monthlyIncome - monthlyTaxTotal);
  const effectiveRatePct = monthlyIncome > 0 ? (monthlyTaxTotal / monthlyIncome) * 100 : 0;
  return {
    monthlyTaxTotal,
    annualTaxTotal: monthlyTaxTotal * 12,
    netAnnual: netMonthly * 12,
    netMonthly,
    effectiveRatePct,
  };
}

/** -------------------- FAQ po zemlji (kratko, demo) -------------------- */
const FAQS: Record<
  string,
  { id: string; question: string; answer: string }[]
> = {
  Srbija: [
    {
      id: 'registration',
      question: 'Kako se registrujem kao preduzetnik?',
      answer:
        'Elektronski preko APR portala ili lično. Potrebna lična karta, šifra delatnosti i dokazi o uplati taksi.',
    },
    {
      id: 'foreign-clients',
      question: 'Da li mogu raditi za strane klijente?',
      answer:
        'Da. Za EU klijente primenjuje se reverse-charge (oni obračunavaju PDV). Prati svoje pragove za PDV.',
    },
    {
      id: 'efaktura',
      question: 'Šta je eFaktura?',
      answer:
        'Sistem elektronskih faktura za B2B u Srbiji. Za strane klijente nije obavezna, ali je korisna za evidenciju.',
    },
  ],
  Hrvatska: [
    {
      id: 'hok',
      question: 'Gde registrujem obrt?',
      answer:
        'Putem HOK/Fina kanala. Za paušalni obrt prate se pragovi za PDV i godišnji limit prihoda.',
    },
  ],
  'Bosna i Hercegovina': [
    {
      id: 'entiteti',
      question: 'Da li su pravila ista u FBiH i RS?',
      answer:
        'Ne. Postoje razlike po entitetima/kantonima – obavezno proveriti lokalne propise.',
    },
  ],
  'Crna Gora': [
    {
      id: 'registracija',
      question: 'Kako postajem preduzetnik?',
      answer:
        'Prijava u nadležnoj upravi/registru, poslovni račun, poreske i doprinose prijave.',
    },
  ],
};

/** -------------------- Komponenta -------------------- */

export default function TaxGuideContent() {
  // zemlja i opcija
  const [selectedCountry, setSelectedCountry] = useState<string>('Srbija');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('srbija-pausal');

  // iznosi – inicijal po valuti zemlje (RSD default visoko da UI “živi”)
  const countryCurrency =
    balkanCountriesInfo.find((c) => c.country === selectedCountry)?.currency || 'RSD';

  const [monthlyIncome, setMonthlyIncome] = useState<number>(countryCurrency === 'RSD' ? 500_000 : 3_000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(countryCurrency === 'RSD' ? 50_000 : 300);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // opcije filtrirane po zemlji
  const filteredOptions = useMemo(
    () => balkanTaxOptions.filter((o) => o.country === selectedCountry),
    [selectedCountry]
  );

  // podrazumevana opcija kad se promeni zemlja
  useEffect(() => {
    if (!filteredOptions.length) return;
    // biramo prvu kao default
    setSelectedOptionId(filteredOptions[0].id);

    // resetujemo iznose na nešto razumno za valutu zemlje
    const cur = balkanCountriesInfo.find((c) => c.country === selectedCountry)?.currency || 'RSD';
    if (cur === 'RSD') {
      setMonthlyIncome(500_000);
      setMonthlyExpenses(50_000);
    } else if (cur === 'EUR') {
      setMonthlyIncome(3_000);
      setMonthlyExpenses(300);
    } else if (cur === 'BAM') {
      setMonthlyIncome(3_000); // BAM kao ~EUR aproksim.
      setMonthlyExpenses(300);
    } else {
      setMonthlyIncome(3_000);
      setMonthlyExpenses(300);
    }
  }, [selectedCountry]); // eslint-disable-line

  const selectedTaxOption = filteredOptions.find((o) => o.id === selectedOptionId);

  // kalkulacija po izabranoj opciji
  const result: CalcResult = useMemo(() => {
    if (!selectedTaxOption) {
      return {
        monthlyTaxTotal: 0,
        annualTaxTotal: 0,
        netAnnual: monthlyIncome * 12,
        netMonthly: monthlyIncome,
        effectiveRatePct: 0,
      };
    }
    const mode: CalcMode =
      selectedTaxOption.calcMode ||
      (selectedTaxOption.estimatedMonthlyCost > 0 && selectedTaxOption.taxRate === 0
        ? 'flat'
        : 'income');

    if (mode === 'flat') return calcFlat(selectedTaxOption, monthlyIncome);
    if (mode === 'company') return calcCompany(selectedTaxOption, monthlyIncome, monthlyExpenses);
    return calcIncome(selectedTaxOption, monthlyIncome, monthlyExpenses);
  }, [selectedTaxOption, monthlyIncome, monthlyExpenses]);

  // poređenje flat vs income (ako obe postoje u zemlji)
  const comparison = useMemo(() => {
    const flatOpt = filteredOptions.find((o) => (o.calcMode ?? (o.estimatedMonthlyCost > 0 && o.taxRate === 0 ? 'flat' : 'income')) === 'flat');
    const incomeOpt = filteredOptions.find((o) => (o.calcMode ?? (o.estimatedMonthlyCost > 0 && o.taxRate === 0 ? 'flat' : 'income')) === 'income');

    const flat = flatOpt ? calcFlat(flatOpt, monthlyIncome) : null;
    const inc = incomeOpt ? calcIncome(incomeOpt, monthlyIncome, monthlyExpenses) : null;

    return { flat, inc };
  }, [filteredOptions, monthlyIncome, monthlyExpenses]);

  const faqs = FAQS[selectedCountry] ?? [];

  const countryInfo = balkanCountriesInfo.find((c) => c.country === selectedCountry);
  const currency = countryInfo?.currency || selectedTaxOption?.currency || 'RSD';

  const overLimit =
    selectedTaxOption?.maxIncome &&
    monthlyIncome * 12 > (selectedTaxOption.maxIncome as number);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex justify-center items-center">
              <div className="p-4 bg-white/20 rounded-full">
                <FileText className="w-12 h-12" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center">
              Poreski vodič – {selectedCountry}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl text-center opacity-90">
              Poređenje <span className="font-semibold">paušal / stvarni prihod / kompanija</span>,
              kalkulatori i korisni linkovi – prilagođeno za više balkanskih zemalja.
            </p>

            {/* Country selector */}
            <div className="w-full max-w-lg">
              <label className="block text-sm font-medium mb-2">Izaberi zemlju</label>
              <select
                className="w-full rounded-lg p-3 text-gray-900 border-2 border-white/40 bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/80"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {balkanCountriesInfo.map((c) => (
                  <option key={c.country} value={c.country}>
                    {c.country}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center gap-3 text-xs md:text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                Demo parametri (ažuriraj po potrebi)
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <ExternalLink className="w-4 h-4" />
                Oficijalni linkovi
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Calculator className="w-4 h-4" />
                Kalkulatori
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Tax Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredOptions.length === 0 && (
            <div className="lg:col-span-3 bg-white rounded-2xl shadow p-6">
              Nema definisanih opcija za {selectedCountry}. Dodaj ih u <code>balkanTaxOptions</code>.
            </div>
          )}

          {filteredOptions.map((option, index) => {
            const isSelected = selectedOptionId === option.id;
            return (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                className={`bg-white rounded-2xl shadow p-6 cursor-pointer transition-all duration-300 ${
                  isSelected ? 'border-2 border-indigo-500 shadow-xl' : 'border-2 border-transparent hover:shadow-xl'
                }`}
                onClick={() => setSelectedOptionId(option.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{option.name}</h3>
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4">{option.description}</p>

                {/* Pros */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-green-700 mb-2">Prednosti:</h4>
                  <ul className="space-y-1">
                    {option.pros.slice(0, 3).map((pro, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Best For */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-blue-700 mb-2">Najbolje za:</h4>
                  <div className="flex flex-wrap gap-1">
                    {option.bestFor.slice(0, 3).map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Ažurirano: {option.lastUpdated}</span>
                  <a
                    href={option.officialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Oficijalni link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Calculator className="w-6 h-6 text-indigo-600" />
            Poreski kalkulator
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesečni bruto prihod ({currency})
                </label>
                <input
                  type="number"
                  value={Number.isFinite(monthlyIncome) ? monthlyIncome : 0}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none text-lg font-semibold"
                />
                <p className="text-xs text-gray-500 mt-1">{usdEq(monthlyIncome, currency)} ekvivalent</p>
              </div>

              {selectedTaxOption?.calcMode !== 'flat' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mesečni troškovi ({currency})
                  </label>
                  <input
                    type="number"
                    value={Number.isFinite(monthlyExpenses) ? monthlyExpenses : 0}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value) || 0)}
                    className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Oprema, internet, softver, putovanja…</p>
                </div>
              )}

              {/* Income Limits Warning */}
              {overLimit && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Prekoračen limit za ovu opciju</p>
                      <p className="text-xs text-red-700 mt-1">
                        Godišnji limit je {formatMoney(selectedTaxOption!.maxIncome!, currency)}.
                        Razmotri prelazak na drugi model.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedTaxOption ? `${selectedTaxOption.name} – kalkulacija` : 'Kalkulacija'}
              </h3>

              {/* Detalji po modu */}
              {selectedTaxOption?.calcMode === 'flat' ? (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mesečni bruto</span>
                    <span className="font-semibold">{formatMoney(monthlyIncome, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mesečni fiksni trošak</span>
                    <span className="text-red-600 font-semibold">
                      -{formatMoney(selectedTaxOption.estimatedMonthlyCost, currency)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between">
                    <span className="font-medium">Mesečni neto</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatMoney(result.netMonthly, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Godišnji neto</span>
                    <span className="font-semibold text-green-600">
                      {formatMoney(result.netAnnual, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efektivna stopa</span>
                    <span className="font-semibold">{result.effectiveRatePct.toFixed(1)}%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mesečni bruto</span>
                    <span className="font-semibold">{formatMoney(monthlyIncome, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mesečni troškovi</span>
                    <span className="text-blue-600">
                      -{formatMoney(monthlyExpenses, currency)}
                    </span>
                  </div>
                  {typeof result.incomeTaxMonthly === 'number' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Porez na dohodak ({selectedTaxOption?.taxRate ?? 0}%)
                      </span>
                      <span className="text-red-600">
                        -{formatMoney(Math.round(result.incomeTaxMonthly), currency)}
                      </span>
                    </div>
                  )}
                  {typeof result.contributionsMonthly === 'number' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Doprinosi ({pctFromString(selectedTaxOption?.socialContributions ?? '', 36)}%)
                      </span>
                      <span className="text-red-600">
                        -{formatMoney(Math.round(result.contributionsMonthly), currency)}
                      </span>
                    </div>
                  )}

                  {selectedTaxOption?.calcMode === 'company' && selectedTaxOption?.estimatedMonthlyCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fiksni mesečni troškovi (knjig., ostalo)</span>
                      <span className="text-red-600">
                        -{formatMoney(selectedTaxOption.estimatedMonthlyCost, currency)}
                      </span>
                    </div>
                  )}

                  <hr />
                  <div className="flex justify-between">
                    <span className="font-medium">Mesečni neto</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatMoney(result.netMonthly, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Efektivna stopa</span>
                    <span className="font-semibold">{result.effectiveRatePct.toFixed(1)}%</span>
                  </div>
                </div>
              )}

              {/* Comparison */}
              {(comparison.flat || comparison.inc) && (
                <div className="mt-6 p-4 bg-white rounded-lg border">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Poređenje modela:</h4>
                  <div className="space-y-2 text-sm">
                    {comparison.flat && (
                      <div className="flex justify-between">
                        <span>Paušal (neto mesečno):</span>
                        <span
                          className={`font-medium ${
                            selectedTaxOption?.calcMode === 'flat' ? 'text-green-600' : 'text-gray-700'
                          }`}
                        >
                          {formatMoney(Math.round(comparison.flat.netMonthly), currency)}
                        </span>
                      </div>
                    )}
                    {comparison.inc && (
                      <div className="flex justify-between">
                        <span>Stvarni prihod (neto mesečno):</span>
                        <span
                          className={`font-medium ${
                            selectedTaxOption?.calcMode === 'income' ? 'text-green-600' : 'text-gray-700'
                          }`}
                        >
                          {formatMoney(Math.round(comparison.inc.netMonthly), currency)}
                        </span>
                      </div>
                    )}
                    {comparison.flat && comparison.inc && (
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Razlika:</span>
                          <span
                            className={
                              comparison.flat.netMonthly > comparison.inc.netMonthly ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            {formatMoney(
                              Math.abs(Math.round(comparison.flat.netMonthly - comparison.inc.netMonthly)),
                              currency
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Često postavljana pitanja</h2>

          <div className="space-y-4">
            {faqs.length === 0 && (
              <div className="text-sm text-gray-600">
                Dodaj FAQ za zemlju <span className="font-medium">{selectedCountry}</span> u konstanti <code>FAQS</code>.
              </div>
            )}

            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {(countryInfo?.usefulLinks ?? []).map((link) => {
            let host = link;
            try {
              host = new URL(link).hostname.replace('www.', '');
            } catch {}
            const nice = host.split('/')[0];
            return (
              <a
                key={link}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">{nice}</h3>
                </div>
                <p className="text-gray-600 mb-4 break-all">{link}</p>
                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                  Otvori <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
