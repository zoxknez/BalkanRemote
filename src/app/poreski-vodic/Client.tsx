"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

type CalcMode = 'flat' | 'income' | 'company';

interface BalkanTaxOption {
	id: string;
	country: string;
	name: string;
	description: string;
	pros: string[];
	cons: string[];
	requirements: string[];
	taxRate: number;
	minIncome?: number;
	maxIncome?: number;
	socialContributions: string;
	bestFor: string[];
	officialLink: string;
	estimatedMonthlyCost: number;
	currency: string;
	lastUpdated: string;
	calcMode?: CalcMode;
	extraRates?: {
		dividendTax?: number;
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
    calcLinks?: string[];
}

const FX_TO_USD: Record<string, number> = {
	RSD: 1 / 117,
	EUR: 1.08,
	BAM: 0.55,
	ALL: 1 / 92,
	MKD: 1 / 57,
};

const pctFromString = (txt: string, fallbackPct: number) => {
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
		return `${value.toLocaleString()} ${currency}`;
	}
};

const usdEq = (amount: number, currency: string) => {
	const fx = FX_TO_USD[currency] ?? 0;
	if (!fx) return '';
	const usd = amount * fx;
	return `~$${Math.round(usd).toLocaleString()}`;
};

const balkanCountriesInfo: CountryTaxInfo[] = [
	{
		country: 'Srbija',
		currency: 'RSD',
		minWage: 50000,
		avgSalary: 95000,
		vatThreshold: 8000000,
		doubleTaxationTreaties: ['EU zemlje', 'USA', 'UK', 'Kanada', 'Australija'],
		popularBanks: ['Banca Intesa', 'Raiffeisen', 'OTP', 'NLB'],
		usefulLinks: [
			'https://www.purs.gov.rs',
			'https://www.apr.gov.rs',
			'https://efaktura.gov.rs',
			'https://eporezi.purs.gov.rs',
			'https://www.nbs.rs',
		],
		calcLinks: ['https://eporezi.purs.gov.rs'],
	},
	{
		country: 'Hrvatska',
		currency: 'EUR',
		minWage: 700,
		avgSalary: 1100,
		vatThreshold: 40000,
		doubleTaxationTreaties: ['EU zemlje', 'USA', 'UK', 'Kanada'],
		popularBanks: ['Zagrebačka banka', 'PBZ', 'Erste banka', 'OTP'],
		usefulLinks: [
			'https://www.porezna-uprava.hr',
			'https://www.hok.hr',
			'https://www.fina.hr',
			'https://e-porezna.porezna-uprava.hr',
			'https://mfin.gov.hr',
		],
		calcLinks: ['https://e-porezna.porezna-uprava.hr'],
	},
	{
		country: 'Bosna i Hercegovina',
		currency: 'BAM',
		minWage: 540,
		avgSalary: 1000,
		vatThreshold: 50000,
		doubleTaxationTreaties: ['EU zemlje (SAA)', 'Susedne zemlje'],
		popularBanks: ['UniCredit', 'Raiffeisen', 'NLB banka', 'Sparkasse'],
		usefulLinks: [
			'https://www.uino.gov.ba',
			'https://www.pufbih.ba',
			'https://www.poreskaupravars.org',
			'https://www.fbihvlada.gov.ba',
		],
		calcLinks: ['https://www.pufbih.ba'],
	},
	{
		country: 'Crna Gora',
		currency: 'EUR',
		minWage: 450,
		avgSalary: 800,
		vatThreshold: 18000,
		doubleTaxationTreaties: ['EU zemlje', 'Balkan'],
		popularBanks: ['CKB', 'NLB banka', 'Hipotekarna banka'],
		usefulLinks: [
			'https://www.poreskauprava.gov.me',
			'https://www.cbcg.me',
			'https://www.gov.me',
		],
		calcLinks: ['https://www.poreskauprava.gov.me'],
	},
];

// Zvanična dokumenta i obrasci (osnovni portali/e-servisi po zemlji)
const OFFICIAL_DOCS: Record<string, { name: string; url: string }[]> = {
    'Srbija': [
        { name: 'Poreska uprava – ePorezi', url: 'https://eporezi.purs.gov.rs' },
        { name: 'Poreska uprava – zvanični portal', url: 'https://www.purs.gov.rs' },
        { name: 'APR – registri i e-registracija', url: 'https://www.apr.gov.rs' },
        { name: 'Sistem eFaktura', url: 'https://efaktura.gov.rs' },
        { name: 'Narodna banka Srbije', url: 'https://www.nbs.rs' },
    ],
    'Hrvatska': [
        { name: 'Porezna uprava – ePorezna', url: 'https://e-porezna.porezna-uprava.hr' },
        { name: 'Porezna uprava – zvanični portal', url: 'https://www.porezna-uprava.hr' },
        { name: 'FINA – servisi i e-Račun', url: 'https://www.fina.hr' },
        { name: 'HOK – Obrtnici', url: 'https://www.hok.hr' },
        { name: 'Ministarstvo financija', url: 'https://mfin.gov.hr' },
    ],
    'Bosna i Hercegovina': [
        { name: 'UINO – Uprava za indirektno oporezivanje (PDV)', url: 'https://www.uino.gov.ba' },
        { name: 'Porezna uprava FBiH', url: 'https://www.pufbih.ba' },
        { name: 'Poreska uprava RS', url: 'https://www.poreskaupravars.org' },
    ],
    'Crna Gora': [
        { name: 'Poreska uprava Crne Gore', url: 'https://www.poreskauprava.gov.me' },
        { name: 'Centralna banka Crne Gore', url: 'https://www.cbcg.me' },
        { name: 'Vlada Crne Gore – portal', url: 'https://www.gov.me' },
    ],
};

const balkanTaxOptions: BalkanTaxOption[] = [
	// Srbija
	{
		id: 'srbija-pausal',
		country: 'Srbija',
		name: 'Paušalno oporezivanje (Grupa II)',
		description:
			'Najpopularniji model za freelancere. Fiksan mesečni iznos (demo).',
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
		estimatedMonthlyCost: 34530,
		currency: 'RSD',
		lastUpdated: '2025-01-01',
		calcMode: 'flat',
	},
	{
		id: 'srbija-stvarni-prihod',
		country: 'Srbija',
		name: 'Stvarni prihod (knjige)',
		description:
			'Oporezivanje na osnovu stvarno ostvarenog prihoda umanjeno za troškove; doprinosi po stopama.',
		pros: ['Mogućnost priznanja troškova', 'Fleksibilno za više prihode'],
		cons: ['Složenije knjigovodstvo', 'Varijabilna davanja'],
		requirements: ['Evidencije prihoda i rashoda', 'Knjigovodstvo'],
		taxRate: 10,
		socialContributions: 'PIO/ZDR ~36% na osnovicu (demo)',
		bestFor: ['Viši prihodi', 'Troškovi > 20%'],
		officialLink: 'https://www.purs.gov.rs',
		estimatedMonthlyCost: 0,
		currency: 'RSD',
		lastUpdated: '2025-01-01',
		calcMode: 'income',
	},
	{
		id: 'srbija-doo',
		country: 'Srbija',
		name: 'D.O.O. (porez na dobit + dividenda)',
		description:
			'Pravno lice sa porezom na dobit i oporezivanjem dividendi; pogodno za reinvestiranje.',
		pros: ['Odvajanje ličnog i poslovnog', 'Skalabilno'],
		cons: ['Trošak osnivanja i vođenja', 'Pravila za isplate'],
		requirements: ['Osnivanje DOO', 'Knjigovodstvo', 'Računovodstveni servis'],
		taxRate: 15,
		socialContributions: 'Zavisi od ugovora o radu/menadžerskog ugovora',
		bestFor: ['Agencije', 'Timovi', 'Reinvestiranje'],
		officialLink: 'https://www.apr.gov.rs',
		estimatedMonthlyCost: 20000,
		currency: 'RSD',
		lastUpdated: '2025-01-01',
		calcMode: 'company',
		extraRates: { dividendTax: 15 },
	},

	// Hrvatska
	{
		id: 'hrvatska-pausalni-obrt',
		country: 'Hrvatska',
		name: 'Paušalni obrt',
		description:
			'Jednostavan režim s paušalnim porezom po razredima; PDV prag u EUR.',
		pros: ['Jednostavno', 'Predvidivo'],
		cons: ['Limit prihoda', 'Nema stvarnih troškova'],
		requirements: ['Upis obrta (HOK/Fina)'],
		taxRate: 0,
		socialContributions: 'Doprinosi po paušalu (demo)',
		bestFor: ['Freelanceri', 'Početnici'],
		officialLink: 'https://www.porezna-uprava.hr',
		estimatedMonthlyCost: 150,
		currency: 'EUR',
		lastUpdated: '2025-01-01',
		calcMode: 'flat',
	},
	{
		id: 'hrvatska-obrt-knjige',
		country: 'Hrvatska',
		name: 'Obrt s vođenjem knjiga',
		description: 'Oporezivanje stvarnog dohotka; PDV obveze po pragovima.',
		pros: ['Troškovi se priznaju'],
		cons: ['Složenije knjigovodstvo'],
		requirements: ['Knjigovodstvo'],
		taxRate: 20,
		socialContributions: 'Doprinosi prema osnovici (demo)',
		bestFor: ['Viši prihodi', 'Troškovi > 20%'],
		officialLink: 'https://www.porezna-uprava.hr',
		estimatedMonthlyCost: 0,
		currency: 'EUR',
		lastUpdated: '2025-01-01',
		calcMode: 'income',
	},
	{
		id: 'hrvatska-doo',
		country: 'Hrvatska',
		name: 'D.O.O.',
		description: 'Pravno lice; porez na dobit + dividende; obračuni doprinosa.',
		pros: ['Skalabilno', 'Odvajanje ličnog/poslovnog'],
		cons: ['Troškovi vođenja'],
		requirements: ['Osnivanje DOO', 'Knjigovodstvo'],
		taxRate: 18,
		socialContributions: 'Po osnovi zaposlenja/upravitelja',
		bestFor: ['Agencije', 'Timovi'],
		officialLink: 'https://www.fina.hr',
		estimatedMonthlyCost: 150,
		currency: 'EUR',
		lastUpdated: '2025-01-01',
		calcMode: 'company',
		extraRates: { dividendTax: 10 },
	},

	// Bosna i Hercegovina
	{
		id: 'bih-samostalna',
		country: 'Bosna i Hercegovina',
		name: 'Samostalna djelatnost',
		description: 'Oporezivanje dohotka uz doprinose; razlikuje se po entitetima.',
		pros: ['Priznavanje troškova'],
		cons: ['Razlike po entitetima/kantonima'],
		requirements: ['Registracija', 'Knjigovodstvo'],
		taxRate: 10,
		socialContributions: 'Po propisima entiteta (demo ~31-41%)',
		bestFor: ['Freelanceri', 'Viši prihodi'],
		officialLink: 'https://www.uino.gov.ba',
		estimatedMonthlyCost: 0,
		currency: 'BAM',
		lastUpdated: '2025-01-01',
		calcMode: 'income',
	},
	{
		id: 'bih-doo',
		country: 'Bosna i Hercegovina',
		name: 'D.O.O.',
		description: 'Porez na dobit + eventualna dividenda; razlike po entitetima.',
		pros: ['Skalabilno'],
		cons: ['Troškovi i administracija'],
		requirements: ['Osnivanje DOO', 'Knjigovodstvo'],
		taxRate: 10,
		socialContributions: 'Prema ugovoru o radu',
		bestFor: ['Agencije'],
		officialLink: 'https://www.uino.gov.ba',
		estimatedMonthlyCost: 80,
		currency: 'BAM',
		lastUpdated: '2025-01-01',
		calcMode: 'company',
		extraRates: { dividendTax: 5 },
	},

	// Crna Gora
	{
		id: 'cg-preduzetnik-pausal',
		country: 'Crna Gora',
		name: 'Preduzetnik (paušal / forfetar)',
		description: 'Jednostavniji režim sa paušalnim davanjima u nekim opštinama.',
		pros: ['Jednostavno'],
		cons: ['Limit prihoda', 'Razlike po opštinama'],
		requirements: ['Registracija'],
		taxRate: 0,
		socialContributions: 'Paušalni doprinosi (demo)',
		bestFor: ['Početnici'],
		officialLink: 'https://www.poreskauprava.gov.me',
		estimatedMonthlyCost: 70,
		currency: 'EUR',
		lastUpdated: '2025-01-01',
		calcMode: 'flat',
	},
	{
		id: 'cg-doo',
		country: 'Crna Gora',
		name: 'D.O.O.',
		description: 'Porez na dobit + dividenda; doprinosi po zaposlenju/upravljanju.',
		pros: ['Odvajanje ličnog/poslovnog'],
		cons: ['Troškovi vođenja'],
		requirements: ['Osnivanje DOO', 'Knjigovodstvo'],
		taxRate: 9,
		socialContributions: 'Prema ugovoru',
		bestFor: ['Agencije', 'Timovi'],
		officialLink: 'https://www.cbcg.me',
		estimatedMonthlyCost: 90,
		currency: 'EUR',
		lastUpdated: '2025-01-01',
		calcMode: 'company',
		extraRates: { dividendTax: 9 },
	},
];

type CalcResult = {
	monthlyTaxTotal: number;
	annualTaxTotal: number;
	netAnnual: number;
	netMonthly: number;
	effectiveRatePct: number;
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
	const taxPct = (option.taxRate || 0) / 100;
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
	const monthlyProfit = Math.max(0, monthlyIncome - monthlyExpenses);
	const profitTaxPct = (option.taxRate || 0) / 100;
	const dividendPct = (option.extraRates?.dividendTax ?? 0) / 100;
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

const FAQS: Record<string, { id: string; question: string; answer: string }[]> = {
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

const MYTHS: Record<string, { title: string; text: string }[]> = {
	Srbija: [
		{ title: 'Paušal je uvek najbolji', text: 'Nije nužno – nakon određenog prihoda i strukture troškova, knjige ili DOO mogu biti povoljniji.' },
		{ title: 'Za strane klijente obavezno PDV', text: 'Usluge prema inostranstvu obično su u reverse-charge režimu; prati PDV prag i pravila.' },
		{ title: 'eFaktura je obavezna za sve', text: 'Za inostrane klijente nije nužno, ali je korisna za evidenciju i domaće B2B prometa.' },
	],
	Hrvatska: [
		{ title: 'Paušalni obrt nema ograničenja', text: 'Postoje pragovi (npr. PDV prag) i razredi; iznad njih razmotri knjige ili DOO.' },
		{ title: 'Ne treba voditi evidenciju', text: 'Evidencije i obveze postoje i za paušalni obrt; čuvaj račune i vodi knjige po propisu.' },
		{ title: 'Za remote klijente uvijek PDV', text: 'Ovisi o mjestu oporezivanja; često se primjenjuje reverse-charge izvan HR.' },
	],
	'Bosna i Hercegovina': [
		{ title: 'Pravila su ista svuda', text: 'Ne – razlikuju se po entitetima/kantonima. Obavezno provjeri lokalne propise.' },
		{ title: 'Nema PDV brige za freelancere', text: 'PDV obveza nastaje nakon praga; vodi računa o mjestu oporezivanja usluga.' },
		{ title: 'Ugovori nisu bitni', text: 'Ugovori i evidencije su ključni za dokazivanje prihoda/troškova i porezne svrhe.' },
	],
	'Crna Gora': [
		{ title: 'Paušal je isti u svim opštinama', text: 'Ne – iznosi i pravila variraju po opštinama. Provjeri lokalne odluke.' },
		{ title: 'Bez knjigovodstva može proći', text: 'I uz jednostavnije režime preporučeno je uredno vođenje evidencija i izvještaja.' },
		{ title: 'PDV nije relevantan', text: 'Postoji prag (npr. 18k EUR); nakon njega slijedi PDV registracija i obveze.' },
	],
};

// Brzi scenariji po valuti/zemlji (demo vrednosti)
const PRESETS = {
	RSD: [
		{ label: 'Junior', income: 120_000, expensesPct: 0.08 },
		{ label: 'Medior', income: 250_000, expensesPct: 0.1 },
		{ label: 'Senior', income: 500_000, expensesPct: 0.12 },
	],
	EUR: [
		{ label: 'Junior', income: 1500, expensesPct: 0.08 },
		{ label: 'Medior', income: 3000, expensesPct: 0.1 },
		{ label: 'Senior', income: 5000, expensesPct: 0.12 },
	],
	BAM: [
		{ label: 'Junior', income: 1500, expensesPct: 0.08 },
		{ label: 'Medior', income: 3000, expensesPct: 0.1 },
		{ label: 'Senior', income: 4500, expensesPct: 0.12 },
	],
} as const;

// Koraci registracije (sažeto, informativno)
const REGISTRATION_STEPS: Record<string, string[]> = {
	Srbija: [
		'Proveri šifru delatnosti (npr. 62.01 Programiranje).',
		'Registracija u APR (preduzetnik ili DOO).',
		'Otvori poslovni račun u banci.',
		'Prijavi se na ePorezi, podnesi poreske prijave.',
		'eFaktura za B2B (za inostrane kupce po potrebi evidencija).',
		'Knjiženje i obračuni (paušal/knjige/DOO).',
	],
	Hrvatska: [
		'Odaberi obrt (paušal) ili obrt s knjigama / DOO.',
		'Registracija preko HOK/FINA; OIB/e-Građani nalozi.',
		'Otvori poslovni račun i prijavi doprinose.',
		'Prati PDV prag, e-Porezna evidencije i obveze.',
		'Izdavanje računa (e-račun po potrebi), knjigovodstvo.',
	],
	'Bosna i Hercegovina': [
		'Odaberi djelatnost; provjeri propise po entitetu/kantonu.',
		'Registracija samostalne djelatnosti ili DOO.',
		'Otvori poslovni račun; prijave doprinosa.',
		'Evidencije, PDV pragovi (ako je primjenjivo).',
		'Izdavanje računa i redovni obračuni.',
	],
	'Crna Gora': [
		'Registracija preduzetnika ili DOO.',
		'Otvori poslovni račun; prijava u Poreskoj upravi.',
		'Evidencije, doprinosi, fiskalne obaveze.',
		'Izdavanje računa (po potrebi e-servisi).',
	],
};

export default function TaxGuideClient() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const [selectedCountry, setSelectedCountry] = useState<string>('Srbija');
	const [selectedOptionId, setSelectedOptionId] = useState<string>('srbija-pausal');
	const [copied, setCopied] = useState(false);
	const initRef = useRef(true);

	const countryCurrency =
		balkanCountriesInfo.find((c) => c.country === selectedCountry)?.currency || 'RSD';

	const [monthlyIncome, setMonthlyIncome] = useState<number>(countryCurrency === 'RSD' ? 500_000 : 3_000);
	const [monthlyExpenses, setMonthlyExpenses] = useState<number>(countryCurrency === 'RSD' ? 50_000 : 300);
	const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

	const filteredOptions = useMemo(
		() => balkanTaxOptions.filter((o) => o.country === selectedCountry),
		[selectedCountry]
	);

	useEffect(() => {
		if (!filteredOptions.length) return;
		// If current option is not valid for the selected country, default to first
		if (!filteredOptions.some((o) => o.id === selectedOptionId)) {
			setSelectedOptionId(filteredOptions[0].id);
		}

		const cur = balkanCountriesInfo.find((c) => c.country === selectedCountry)?.currency || 'RSD';
		if (cur === 'RSD') {
			setMonthlyIncome(500_000);
			setMonthlyExpenses(50_000);
		} else if (cur === 'EUR') {
			setMonthlyIncome(3_000);
			setMonthlyExpenses(300);
		} else if (cur === 'BAM') {
			setMonthlyIncome(3_000);
			setMonthlyExpenses(300);
		} else {
			setMonthlyIncome(3_000);
			setMonthlyExpenses(300);
		}
	}, [selectedCountry, filteredOptions, selectedOptionId]);

	// Initialize from URL once
	useEffect(() => {
		if (!initRef.current) return;
		initRef.current = false;
		const country = searchParams.get('country');
		const opt = searchParams.get('opt');
		if (country && balkanCountriesInfo.some((c) => c.country === country)) {
			setSelectedCountry(country);
		}
		if (opt) {
			setSelectedOptionId(opt);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// If URL had opt, ensure it's applied after country filters resolve
	useEffect(() => {
		const opt = searchParams.get('opt');
		if (opt && filteredOptions.some((o) => o.id === opt)) {
			setSelectedOptionId(opt);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCountry, filteredOptions]);

	// Reflect selection to URL
	useEffect(() => {
		const p = new URLSearchParams(searchParams.toString());
		p.set('country', selectedCountry);
		if (selectedOptionId) p.set('opt', selectedOptionId);
		router.replace(`${pathname}?${p.toString()}`, { scroll: false });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedCountry, selectedOptionId]);

	const selectedTaxOption = filteredOptions.find((o) => o.id === selectedOptionId);

	const result = useMemo(() => {
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
				{/* TOC */}
				<div className="grid gap-6 md:grid-cols-[260px_1fr] items-start mb-8">
					<aside className="bg-white rounded-xl border p-4 sticky top-4">
						<div className="text-sm font-semibold text-gray-900 mb-2">Sadržaj</div>
						<nav className="text-sm text-gray-700 space-y-1">
							<a href="#recommended" className="block hover:text-indigo-600">Preporučeno</a>
							<a href="#options" className="block hover:text-indigo-600">Opcije oporezivanja</a>
							<a href="#calculator" className="block hover:text-indigo-600">Poreski kalkulator</a>
							<a href="#templates" className="block hover:text-indigo-600">Šabloni i primeri</a>
							<a href="#official-docs" className="block hover:text-indigo-600">Dokumenta i obrasci</a>
							<a href="#tools" className="block hover:text-indigo-600">Korisni alati</a>
							<a href="#presets" className="block hover:text-indigo-600">Scenariji prihoda</a>
							<a href="#registration" className="block hover:text-indigo-600">Koraci registracije</a>
							<a href="#myths" className="block hover:text-indigo-600">Mitovi i greške</a>
							<a href="#faq" className="block hover:text-indigo-600">Česta pitanja</a>
							<a href="#links" className="block hover:text-indigo-600">Korisni linkovi</a>
						</nav>
					</aside>
						<div>
						{/* Recommended scenarios at top */}
						<motion.div
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
							className="bg-white rounded-2xl shadow p-6 mb-6"
							id="recommended"
						>
							<h2 className="text-lg font-bold text-gray-900 mb-4">Preporučeno (brzi izbor)</h2>
							<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{(() => {
									const ci = countryInfo;
									const vat = ci?.vatThreshold ?? 0;
									const findOpt = (id: string) => filteredOptions.find(o => o.id === id);
									const rsPausal = findOpt('srbija-pausal');
									const rsMax = rsPausal?.maxIncome ?? 0;
									const eurPreset = (annual: number) => Math.round((annual / 12) * 0.9);
									const items = [] as { title: string; desc: string; optId?: string; income?: number }[];
									if (selectedCountry === 'Srbija') {
										if (rsMax > 0) items.push({ title: 'Paušal', desc: `do ${formatMoney(rsMax, 'RSD')} godišnje`, optId: 'srbija-pausal', income: eurPreset(rsMax) });
										items.push({ title: 'Stvarni prihod', desc: 'iznad limita / veći troškovi', optId: 'srbija-stvarni-prihod', income: eurPreset(Math.max(rsMax + 1, 12 * 600000)) });
										items.push({ title: 'D.O.O.', desc: 'za reinvestiranje / tim', optId: 'srbija-doo', income: eurPreset(12 * 900000) });
									} else if (selectedCountry === 'Hrvatska') {
										items.push({ title: 'Paušalni obrt', desc: `do ${formatMoney(vat, 'EUR')} (PDV prag)`, optId: 'hrvatska-pausalni-obrt', income: eurPreset(vat) });
										items.push({ title: 'Obrt s knjigama', desc: 'iznad praga / troškovi', optId: 'hrvatska-obrt-knjige', income: eurPreset(Math.max(vat + 1, 12 * 3500)) });
										items.push({ title: 'D.O.O.', desc: 'širenje / zapošljavanje', optId: 'hrvatska-doo', income: eurPreset(12 * 5000) });
									} else if (selectedCountry === 'Bosna i Hercegovina') {
										items.push({ title: 'Samostalna djelatnost', desc: `do ${formatMoney(vat, 'BAM')} (PDV prag)`, optId: 'bih-samostalna', income: eurPreset(vat) });
										items.push({ title: 'Samostalna (knjige)', desc: 'iznad praga / troškovi', optId: 'bih-samostalna', income: eurPreset(Math.max(vat + 1, 12 * 3000)) });
										items.push({ title: 'D.O.O.', desc: 'veći projekti / tim', optId: 'bih-doo', income: eurPreset(12 * 4500) });
									} else if (selectedCountry === 'Crna Gora') {
										items.push({ title: 'Preduzetnik (paušal)', desc: 'iznosi variraju po opštinama', optId: 'cg-preduzetnik-pausal', income: eurPreset(Math.max(12 * 1500, (ci?.vatThreshold ?? 0))) });
										items.push({ title: 'Preduzetnik (knjige)', desc: 'za veće troškove', optId: 'cg-preduzetnik-pausal', income: eurPreset(12 * 2500) });
										items.push({ title: 'D.O.O.', desc: 'za agencije/timove', optId: 'cg-doo', income: eurPreset(12 * 4000) });
									}
									return items.map((it, idx) => (
										<div key={idx} className="p-4 rounded-xl border bg-gray-50">
											<div className="font-semibold text-gray-900">{it.title}</div>
											<div className="text-sm text-gray-600 mb-3">{it.desc}</div>
											<button
												onClick={() => {
													if (it.optId) setSelectedOptionId(it.optId);
													if (typeof it.income === 'number') setMonthlyIncome(it.income);
												}}
												className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-100"
											>
												Postavi
											</button>
										</div>
									));
								})()}
							</div>
						</motion.div>
						{/* Quick facts for selected country */}
							{countryInfo && (
							<div className="bg-white rounded-2xl shadow p-6 mb-8">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-bold text-gray-900">Brze činjenice – {countryInfo.country}</h2>
									<button
										onClick={async () => {
											try {
												await navigator.clipboard.writeText(window.location.href);
												setCopied(true);
												setTimeout(() => setCopied(false), 1500);
											} catch {}
										}}
										className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
										title="Kopiraj link sa odabranom zemljom/opcijom"
									>
										{copied ? 'Kopirano ✅' : 'Kopiraj link'}
									</button>
								</div>
								<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
									<div className="p-4 rounded-xl bg-gray-50 border">
										<div className="text-gray-600">Valuta</div>
										<div className="font-semibold text-gray-900">{countryInfo.currency}</div>
									</div>
									<div className="p-4 rounded-xl bg-gray-50 border">
										<div className="text-gray-600">Minimalna plata</div>
										<div className="font-semibold text-gray-900">{formatMoney(countryInfo.minWage, countryInfo.currency)}</div>
									</div>
									<div className="p-4 rounded-xl bg-gray-50 border">
										<div className="text-gray-600">Prosečna plata</div>
										<div className="font-semibold text-gray-900">{formatMoney(countryInfo.avgSalary, countryInfo.currency)}</div>
									</div>
									<div className="p-4 rounded-xl bg-gray-50 border">
										<div className="text-gray-600">PDV prag</div>
										<div className="font-semibold text-gray-900">{formatMoney(countryInfo.vatThreshold, countryInfo.currency)}</div>
									</div>
								</div>
								<div className="grid md:grid-cols-2 gap-4 mt-4">
									<div className="p-4 rounded-xl bg-white border">
										<div className="text-gray-600 mb-1">Ugovori o izbegavanju dvostrukog oporezivanja</div>
										<div className="text-gray-900 font-medium">{countryInfo.doubleTaxationTreaties.length} partnera</div>
									</div>
									<div className="p-4 rounded-xl bg-white border">
										<div className="text-gray-600 mb-2">Popularne banke</div>
										<div className="flex flex-wrap gap-2">
											{(countryInfo.popularBanks ?? []).map((b) => (
												<span key={b} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{b}</span>
											))}
										</div>
									</div>
								</div>
									<p className="text-xs text-gray-500 mt-3">Napomena: Brojevi su približni/demonstrativni – proveri zvanične izvore pre odluke.</p>
							</div>
						)}

						{/* Country-specific disclaimer */}
						{countryInfo && (
							<div className="mb-8 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3">
								<AlertCircle className="w-5 h-5 mt-0.5" />
								<div className="text-sm">
									<div className="font-semibold">Važno (informativno)</div>
									<p>Stope i pragovi mogu varirati po opštini/entitetu. Za tačne izračune koristi zvanične e-servise i konsultuj knjigovodstvo.</p>
									{(countryInfo.calcLinks ?? []).length > 0 && (
										<div className="mt-2">
											{(countryInfo.calcLinks ?? []).map((l) => (
												<a key={l} href={l} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mr-3 text-amber-800 underline">
													Otvori e-servis <ExternalLink className="w-3 h-3" />
												</a>
											))}
										</div>
									)}
								</div>
							</div>
						)}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="grid lg:grid-cols-3 gap-6 mb-12"
							id="options"
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

						{/* Myths & common mistakes */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.35 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="myths"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-4">Najčešće greške i mitovi</h2>
							<div className="grid md:grid-cols-2 gap-4">
								{(MYTHS[selectedCountry] ?? []).map((m, i) => (
									<div key={i} className="p-4 rounded-xl border bg-gray-50">
										<div className="font-semibold text-gray-900">{m.title}</div>
										<div className="text-sm text-gray-600 mt-1">{m.text}</div>
									</div>
								))}
								{(MYTHS[selectedCountry] ?? []).length === 0 && (
									<div className="text-sm text-gray-600">Dodaj mitove/greške za {selectedCountry} u konstanti MYTHS.</div>
								)}
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="calculator"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
								<Calculator className="w-6 h-6 text-indigo-600" />
								Poreski kalkulator
							</h2>

							<div className="grid lg:grid-cols-2 gap-8">
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

								<div className="bg-gray-50 rounded-xl p-6">
									<h3 className="text-lg font-bold text-gray-900 mb-4">
										{selectedTaxOption ? `${selectedTaxOption.name} – kalkulacija` : 'Kalkulacija'}
									</h3>

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

						{/* Templates & examples */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.25 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="templates"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Šabloni i primeri</h2>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								<a href="https://www.invoicesimple.com/invoice-template" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Invoice Template</div>
									<p className="text-sm text-gray-600 mt-1">Brzo fakturisanje (PDF/Excel)</p>
								</a>
								<a href="https://www.hellosign.com/templates" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Ugovori (templates)</div>
									<p className="text-sm text-gray-600 mt-1">NDA, Ugovor o delu, MSAs</p>
								</a>
								<a href="https://docs.google.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Google Docs/Sheets</div>
									<p className="text-sm text-gray-600 mt-1">Šabloni ponuda, profaktura, evidencija</p>
								</a>
							</div>
						</motion.div>

						{/* Scenariji prihoda (preseti) */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.26 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="presets"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-4">Scenariji prihoda</h2>
							<p className="text-sm text-gray-600 mb-4">Brzo postavi tipične vrednosti za računicu.</p>
							<div className="flex flex-wrap gap-3">
								{(PRESETS[currency as keyof typeof PRESETS] ?? PRESETS.RSD).map((p) => (
									<button
										key={p.label}
										onClick={() => {
											setMonthlyIncome(p.income);
											if ((selectedTaxOption?.calcMode ?? 'income') !== 'flat') {
												setMonthlyExpenses(Math.round(p.income * p.expensesPct));
											}
										}}
										className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-sm"
									>
										{p.label}: {formatMoney(p.income, currency)}
									</button>
								))}
							</div>
						</motion.div>

						{/* Tools */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.28 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="tools"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Korisni alati</h2>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								<a href="https://wise.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Wise</div>
									<p className="text-sm text-gray-600 mt-1">SEPA i USD primanja (Multi-currency)</p>
								</a>
								<a href="https://www.payoneer.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Payoneer</div>
									<p className="text-sm text-gray-600 mt-1">Primanje USD iz USA i marketplace-a</p>
								</a>
								<a href="https://www.billable.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Billable</div>
									<p className="text-sm text-gray-600 mt-1">Fakturisanje i praćenje uplata</p>
								</a>
								<a href="https://www.invoicely.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Invoicely</div>
									<p className="text-sm text-gray-600 mt-1">Besplatni plan za fakture</p>
								</a>
								<a href="https://www.hellosign.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">HelloSign (Dropbox Sign)</div>
									<p className="text-sm text-gray-600 mt-1">e-Potpis ugovora</p>
								</a>
								<a href="https://www.notarycam.com/" target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
									<div className="font-semibold text-gray-900">Online notary (US/EU)</div>
									<p className="text-sm text-gray-600 mt-1">Daljinsko overavanje dokumenata</p>
								</a>
							</div>
						</motion.div>

						{/* Official documents & forms */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.27 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="official-docs"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Zvanična dokumenta i obrasci</h2>
							<p className="text-sm text-gray-600 mb-4">Direktni linkovi ka zvaničnim portalima i e-servisima za {selectedCountry}.</p>
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								{(OFFICIAL_DOCS[selectedCountry] ?? []).map((d) => (
									<a key={d.url} href={d.url} target="_blank" rel="noopener noreferrer" className="p-6 rounded-xl border bg-white hover:shadow-md transition">
										<div className="font-semibold text-gray-900">{d.name}</div>
										<p className="text-sm text-gray-600 mt-1 break-all">{d.url}</p>
									</a>
								))}
								{(OFFICIAL_DOCS[selectedCountry] ?? []).length === 0 && (
									<div className="p-6 rounded-xl border bg-gray-50 text-sm text-gray-700">Nema dodatih dokumenata za ovu zemlju.</div>
								)}
							</div>
						</motion.div>

						{/* Koraci registracije */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.31 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="registration"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Koraci registracije ({selectedCountry})</h2>
							<ol className="list-decimal pl-6 space-y-2 text-gray-700">
								{(REGISTRATION_STEPS[selectedCountry] ?? []).map((s, i) => (
									<li key={i}>{s}</li>
								))}
							</ol>

							{/* HowTo JSON-LD */}
							{(REGISTRATION_STEPS[selectedCountry] ?? []).length > 0 && (
								<script
									type="application/ld+json"
									dangerouslySetInnerHTML={{
										__html: JSON.stringify({
											'@context': 'https://schema.org',
											'@type': 'HowTo',
											name: `Registracija – ${selectedCountry}`,
											step: (REGISTRATION_STEPS[selectedCountry] ?? []).map((s, idx) => ({
												'@type': 'HowToStep',
												name: `Korak ${idx + 1}`,
												text: s,
											})),
										}),
									}}
								/>
							)}

							<p className="text-xs text-gray-500 mt-4">Napomena: Informativno. Za konačnu odluku konsultuj ovlašćeno knjigovodstvo ili Poresku upravu.</p>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="bg-white rounded-2xl shadow-lg p-8 mb-12"
							id="faq"
						>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">Često postavljana pitanja</h2>

							<div className="space-y-4">
								{/* FAQ JSON-LD for SEO */}
								{faqs.length > 0 && (
									<script
										type="application/ld+json"
										dangerouslySetInnerHTML={{
											__html: JSON.stringify({
												'@context': 'https://schema.org',
												'@type': 'FAQPage',
												mainEntity: faqs.map((f) => ({
													'@type': 'Question',
													name: f.question,
													acceptedAnswer: {
														'@type': 'Answer',
														text: f.answer,
													},
												})),
											}),
										}}
									/>
								)}
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

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
							id="links"
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
			</div>
		</div>
	);
}
