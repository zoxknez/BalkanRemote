import { Building2, Globe2, Zap } from 'lucide-react'

export const stats = [
  { value: '200k+', label: 'remote radnika', sub: 'aktivnih na Balkanu' },
  { value: '250+', label: 'IT kompanija', sub: 'zapošljava remote iz regiona' },
  { value: '15+', label: 'praktičnih vodiča', sub: 'za poreze, banke i alate' },
  { value: '6', label: 'balkanske zemlje', sub: 'Srbija, Hrvatska, BiH, CG, Albanija, Severna Makedonija' },
] as const

export const heroHighlights = [
  { icon: Globe2, label: 'remote poslovi', pulse: true },
  { icon: Zap, label: 'praktični saveti i alati', pulse: false },
  { icon: Building2, label: 'lokalne i globalne firme', pulse: false },
] as const
