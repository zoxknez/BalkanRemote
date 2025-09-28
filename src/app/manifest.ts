import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Remote Balkan',
    short_name: 'RBalkan',
    description: 'Sve za remote rad iz Balkana: kalkulatori, vodiči, kompanije i alati.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0b1220',
    theme_color: '#0b1220',
    icons: [
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
  }
}
