import Link from 'next/link'
import { Github, Twitter, Mail, Heart, User } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = [
    {
      title: 'Platforma',
      links: [
        { name: 'Početna', href: '/' },
        { name: 'Saveti', href: '/saveti' },
        { name: 'Poslovi', href: '/poslovi' },
        { name: 'Kompanije', href: '/kompanije' },
      ],
    },
    {
      title: 'Vodiči',
      links: [
        { name: 'Poreski vodič', href: '/poreski-vodic' },
        { name: 'Tax Guide (EN)', href: '/tax-guide' },
        { name: 'Najčešća pitanja', href: '/pitanja' },
        { name: 'Resursi', href: '/resursi' },
      ],
    },
    {
      title: 'Alati & Toolbox',
      links: [
        { name: 'Remote Toolbox', href: '/toolbox' },
        { name: 'Alati za rad', href: '/alati' },
        { name: 'Salary & Tax kalkulator', href: '/poreski-vodic' },
        { name: 'Kontakt', href: '/kontakt' },
      ],
    },
    {
      title: 'Za zajednicu',
      links: [
  { name: 'Otvorite issue', href: 'https://github.com/zoxknez/BalkanRemote/issues/new' },
  { name: 'Repo na GitHub-u', href: 'https://github.com/zoxknez/BalkanRemote' },
        { name: 'Kontakt', href: '/kontakt' },
        { name: 'Podrži projekat', href: 'https://paypal.me/o0o0o0o0o0o0o' },
      ],
    },
  ] as const

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">RB</span>
              </div>
              <span className="text-xl font-bold">Balkan Remote</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Balkan Remote career hub okuplja vodiče, alate i kompanije koje zapošljavaju iz regiona.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://x.com/KoronVirus" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter) profil"
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/zoxknez" 
                target="_blank"
                rel="me noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                title="GitHub profil"
                aria-label="GitHub profil (rel=me)"
              >
                <User className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com/zoxknez/BalkanRemote" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                title="Repo na GitHub-u"
                aria-label="GitHub repozitorijum: BalkanRemote"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="mailto:zoxknez@hotmail.com?subject=Remote%20Balkan%20%E2%80%94%20upit&body=Zdravo%2C%0A%0APovod%3A%20"
                className="text-gray-400 hover:text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                title="Pošalji email"
                aria-label="Pošalji email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.href.startsWith('http') || link.href.startsWith('mailto') ? (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link 
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm">
            © {currentYear} Balkan Remote. Sva prava zadržana.
          </div>
          <a
            href="https://x.com/KoronVirus"
            target="_blank"
            rel="noopener noreferrer"
            title="Autor projekta: o0o0o0o"
            className="group mt-4 md:mt-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-4 py-2 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <Heart className="w-4 h-4 text-white" />
            <span>Autor: o0o0o0o </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
