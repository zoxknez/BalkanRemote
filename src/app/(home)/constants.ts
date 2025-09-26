import { Building2, Globe2, Zap } from 'lucide-react'

export const stats = [
  { value: '200K+', label: 'Remote radnika', sub: 'Aktivnih na Balkanu' },
  { value: '250+', label: 'IT kompanija', sub: 'Zapošljava remote iz regiona' },
  { value: '15+', label: 'Praktičnih vodiča', sub: 'Za poreze, banke i alate' },
  { value: '6', label: 'Balkanske zemlje', sub: 'Srbija, Hrvatska, BiH, CG, Albanija, Severna Makedonija' },
] as const

export const heroHighlights = [
  { icon: Globe2, label: 'Remote iz Balkana', pulse: true },
  { icon: Zap, label: 'Praktični saveti i alati', pulse: false },
  { icon: Building2, label: 'Lokalne i globalne firme', pulse: false },
] as const
