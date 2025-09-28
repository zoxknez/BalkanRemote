"use client";

import Link from 'next/link';
import {
  ExternalLink,
  Linkedin,
  List,
  Globe,
  Video,
  Briefcase,
  Globe2,
  Rocket,
  Headphones,
  BookOpen,
  Newspaper,
  ArrowUp,
} from 'lucide-react';

interface OutLinkProps {
  href: string;
  label: string;
  sub?: string;
}

function OutLink({ href, label, sub }: OutLinkProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-md ring-1 ring-transparent hover:ring-blue-200/60"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900 group-hover:text-blue-700">{label}</div>
          {sub && <div className="text-sm text-gray-600 mt-1">{sub}</div>}
        </div>
        <ExternalLink className="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-blue-700" />
      </div>
    </Link>
  );
}

export default function PosloviContent() {

  return (
    <div className="min-h-screen bg-white">
      {/* Top description bar (consistent with other tabs) */}
      <div id="top" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20">
              <span className="text-3xl">💼</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">Remote poslovi i prečice</h1>
          <p className="text-center text-blue-100 text-lg max-w-3xl mx-auto">
            Pregled remote poslova, freelance platformi i direktorijuma kompanija prilagođen talentima sa Balkana.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link href="/api/jobs/rss" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/20 hover:bg-white/20">
              RSS
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link href="/api/jobs/feed.json" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm ring-1 ring-white/20 hover:bg-white/20">
              JSON
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

        {/* Sections */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* LinkedIn */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 ring-1 ring-blue-600/20">
                  <Linkedin className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">LinkedIn prečice</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OutLink
                  href="https://linkedin.com/jobs/ncr-jobs/?currentJobId=4092876160"
                  label="NCR Voyix – otvorene pozicije (često i remote)"
                  sub="Velik broj oglasa, aktivno zapošljavaju"
                />
                <OutLink
                  href="https://linkedin.com/jobs/remote-jobs/?currentJobId=4089960638"
                  label="LinkedIn: remote poslovi (Srbija filter)"
                  sub="~480 pozicija, menjaj filtere za HR/BA/MNE"
                />
              </div>
            </section>

            {/* Video primer */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600/10 text-rose-600 ring-1 ring-rose-600/20">
                  <Video className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Primeri i kako izgleda posao</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OutLink
                  href="https://youtube.com/watch?v=lfCfqEBwQ8M"
                  label="Dispečer za USA tržište – primer posla"
                  sub="Uvek ima otvorenih pozicija; uz AI brzo se snađeš"
                />
              </div>
            </section>

            {/* Global boards */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 ring-1 ring-indigo-600/20">
                  <Briefcase className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Globalni remote job board-ovi</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OutLink href="https://remoteok.com/" label="Remote OK" sub="Veliki broj IT i non-IT remote oglasa" />
                <OutLink href="https://weworkremotely.com/" label="We Work Remotely" sub="Najpoznatiji remote board (razne kategorije)" />
                <OutLink href="https://remotive.com/remote-jobs" label="Remotive" sub="Filteri po kategoriji, plate i timezone" />
                <OutLink href="https://remote.co/remote-jobs/" label="Remote.co" sub="Poslovi + resursi za remote timove" />
                <OutLink href="https://dailyremote.com/" label="DailyRemote" sub="Dnevno ažuriranje, puno kategorija" />
                <OutLink href="https://jobspresso.co/" label="Jobspresso" sub="Kurirani remote IT/marketing/dizajn poslovi" />
              </div>
            </section>

            {/* Direktorijumi IT kompanija */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 ring-1 ring-blue-600/20">
                  <Globe className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Direktorijumi IT kompanija</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OutLink
                  href="https://clutch.co/rs/it-services"
                  label="Clutch – IT firme u Srbiji"
                  sub="Direktorijum kompanija; izdvoji favorite i šalji CV"
                />
                <OutLink
                  href="https://joberty.com/IT-companies?page=1&sort=featured"
                  label="Joberty – IT kompanije (globalno)"
                  sub="Pretraži i filtriraj; pročitaj recenzije"
                />
              </div>
            </section>

            {/* EU timezone */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 ring-1 ring-emerald-600/20">
                  <Globe2 className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">EU / timezone-friendly pozicije</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OutLink href="https://euremotejobs.com/" label="EU Remote Jobs" sub="Remote poslovi unutar EU timezone-a" />
                <OutLink href="https://nofluffjobs.com/remote" label="No Fluff Jobs (remote)" sub="Kvalitetni IT oglasi u CEE regionu" />
                <OutLink href="https://wellfound.com/jobs?remote=true" label="Wellfound (ex AngelList)" sub="Startup poslovi – uključi remote filter" />
              </div>
            </section>

            {/* Freelance & vetted */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-600/10 text-fuchsia-600 ring-1 ring-fuchsia-600/20">
                  <Rocket className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Freelance i vetted platforme</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OutLink href="https://www.upwork.com/" label="Upwork" sub="Najveći marketplace" />
                <OutLink href="https://www.fiverr.com/" label="Fiverr" sub="Mikro-usluge i gig poslovi" />
                <OutLink href="https://www.toptal.com/" label="Toptal" sub="Vetted network – veće dnevnice" />
                <OutLink href="https://www.usebraintrust.com/" label="Braintrust" sub="Bez provizije od radnika" />
                <OutLink href="https://contra.com/" label="Contra" sub="Portfolio + poslovi" />
                <OutLink href="https://arc.dev/remote-jobs" label="Arc.dev" sub="Remote dev pozicije" />
              </div>
            </section>

            {/* Customer support / VA */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600/10 text-cyan-600 ring-1 ring-cyan-600/20">
                  <Headphones className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Customer Support / Virtual Assistant</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OutLink href="https://jobs.supportdriven.com/" label="Support Driven Jobs" sub="Community za CS" />
                <OutLink
                  href="https://weworkremotely.com/categories/remote-customer-support-jobs"
                  label="WWR: Customer Support"
                  sub="Specifična CS kategorija"
                />
                <OutLink
                  href="https://remotive.com/remote-jobs/customer-support"
                  label="Remotive: Customer Support"
                  sub="Customer success i support"
                />
              </div>
            </section>

            {/* Teaching */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/10 text-amber-600 ring-1 ring-amber-600/20">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Predavanje engleskog online</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OutLink href="https://preply.com/en/online/teaching-jobs" label="Preply" sub="Fleksibilni sati" />
                <OutLink href="https://www.italki.com/teachers" label="iTalki" sub="Globalna baza učenika" />
                <OutLink href="https://www.cambly.com/en/tutors" label="Cambly" sub="Brz start, kratke sesije" />
                <OutLink href="https://www.ef.com/teachonline/" label="EF Teach Online" sub="Veće škole, stabilni termini" />
                <OutLink
                  href="https://www.goodairlanguage.com/teaching-english-online-2/"
                  label="Lista kompanija za online predavanje engleskog"
                  sub="Sve platforme na jednom mestu"
                />
              </div>
            </section>

            {/* Blogovi / vodiči */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 ring-1 ring-purple-600/20">
                  <Newspaper className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Blogovi i vodiči (ažurno)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OutLink href="https://zapier.com/learn/remote-work/" label="Zapier – Remote Work Guide" sub="Alati, praksa, kultura" />
                <OutLink
                  href="https://about.gitlab.com/company/culture/all-remote/"
                  label="GitLab – All Remote Handbook"
                  sub="Top dokumentacija"
                />
                <OutLink href="https://buffer.com/state-of-remote-work" label="Buffer – State of Remote Work" sub="Godišnji izveštaj" />
                <OutLink href="https://weworkremotely.com/blog" label="WWR – Blog" sub="CV/intervjui/pronalaženje" />
                <OutLink
                  href="https://skillcrush.com/blog/sites-finding-remote-work/"
                  label="Skillcrush – Najbolji sajtovi za remote poslove"
                  sub="Sajtovi po vrstama poslova"
                />
              </div>
            </section>

            {/* Generatori / alati za prijavu */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-600/10 text-green-600 ring-1 ring-green-600/20">
                  <List className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-semibold text-slate-900">Generatori (CV, Cover letter, portfolija)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <OutLink href="https://flowcv.com/" label="FlowCV" sub="Besplatan, čist CV generator" />
                <OutLink href="https://www.tealhq.com/resume-builder" label="Teal Resume Builder" sub="Brzi export i praćenje prijava" />
                <OutLink href="https://www.resume.io/" label="Resume.io" sub="Brzi šabloni i export" />
                <OutLink href="https://coverletter.online/" label="Cover Letter Online" sub="Kratko personalizovana pisma" />
                <OutLink href="https://www.read.cv/" label="Read.cv" sub="Javni CV + portfolio" />
                <OutLink href="https://pages.github.com/" label="GitHub Pages" sub="Besplatan portfolio hosting" />
              </div>
            </section>
          </div>

          {/* Sidebar: saveti i sledeći koraci */}
          <aside className="space-y-8 lg:sticky lg:top-24 self-start">
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <List className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Brzi koraci</h3>
              </div>
              <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
                <li>U LinkedIn filterima uključi Remote, Seniority i Plata</li>
                <li>Na Clutch/Joberty izdvoji 20 firmi i šalji personalizovan CV</li>
                <li>Za ne-IT probaj „dispatcher“, „virtual assistant“, „customer support“</li>
                <li>
                  Prati {' '}
                  <Link href="/kompanije" className="text-blue-600 hover:underline">
                    /kompanije
                  </Link>{' '}
                  za one koje zapošljavaju
                </li>
              </ul>
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Vodiči i sajtovi</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <OutLink
                  href="https://skillcrush.com/blog/sites-finding-remote-work/"
                  label="Najbolji sajtovi za remote poslove"
                  sub="Po kategorijama poslova"
                />
                <OutLink
                  href="https://www.goodairlanguage.com/teaching-english-online-2/"
                  label="Kompanije za predavanje engleskog"
                  sub="Traženi poslovi, fleksibilno"
                />
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Sledeći koraci</h3>
              <ul className="list-disc pl-5 text-sm space-y-2 text-gray-700">
                <li>Uredi LinkedIn i GitHub profil (recent projekti, opis)</li>
                <li>Pripremi 2-3 kratka primera „proof of work“</li>
                <li>U CV ubaci konkretne rezultate (brojevi, uticaj)</li>
                <li>
                  Pogledaj {' '}
                  <Link href="/saveti" className="text-blue-600 hover:underline">
                    /saveti
                  </Link>{' '}
                  za detaljan vodič
                </li>
              </ul>
            </section>

            <Link href="#top" className="inline-flex items-center gap-2 text-gray-600 text-sm hover:text-blue-700 rounded-full border border-gray-200 px-3 py-1.5">
              <ArrowUp className="w-4 h-4" /> Nazad na vrh
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
