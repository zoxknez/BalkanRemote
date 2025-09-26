import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    'Poslovi': [
      { name: 'Remote poslovi', href: '/poslovi' },
      { name: 'IT kompanije', href: '/kompanije' },
      { name: 'Freelance', href: '/poslovi?type=freelance' },
      { name: 'Part-time', href: '/poslovi?type=part-time' }
    ],
    'Resursi': [
      { name: 'Saveti za CV', href: '/saveti/cv' },
      { name: 'Intervju saveti', href: '/saveti/intervju' },
      { name: 'Remote rad saveti', href: '/saveti/remote' },
      { name: 'Alati za rad', href: '/alati' }
    ],
    'Kompanije': [
      { name: 'NCR Voyix', href: '/kompanije/ncr-voyix' },
      { name: 'Clutch', href: '/kompanije/clutch' },
      { name: 'IT firme Srbija', href: '/kompanije?location=serbia' },
      { name: 'Globalne kompanije', href: '/kompanije?location=global' }
    ],
    'O nama': [
      { name: 'O Remote Balkan', href: '/o-nama' },
      { name: 'Kontakt', href: '/kontakt' },
      { name: 'Pridruži se', href: '/pridruji-se' },
      { name: 'Blog', href: '/blog' }
    ]
  }

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
              <span className="text-xl font-bold">Remote Balkan</span>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Najbolja platforma za pronalaženje remote poslova na Balkanu. 
              Povezujemo talente sa globalnim prilikama.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <Link 
                href="/kontakt"
                className="text-gray-400 hover:text-white transition-colors"
                title="Kontakt"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-lg mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-gray-400 text-sm">
            © {currentYear} Remote Balkan. Sva prava zadržana.
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
