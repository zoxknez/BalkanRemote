'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Star, BookOpen, Play, Globe, Mail } from 'lucide-react'
import { Resource } from '@/types'
import { cn } from '@/lib/utils'

interface ResourceCardProps {
  resource: Resource
  className?: string
  badge?: { text: string; color?: 'cyan' | 'purple' | 'green' }
}

export function ResourceCard({ resource, className, badge }: ResourceCardProps) {
  const categoryIcons = {
    sajt: Globe,
    alat: Play,
    kurs: BookOpen,
    blog: BookOpen,
    podcast: Play,
    knjiga: BookOpen,
    newsletter: Mail
  }

  const typeColors = {
    besplatno: 'bg-green-100 text-green-800',
    placeno: 'bg-red-100 text-red-800',
    freemium: 'bg-blue-100 text-blue-800'
  }

  const languageLabels = {
    sr: '🇷🇸 Srpski',
    en: '🇬🇧 Engleski',
    mix: '🌍 Mešano'
  }

  const Icon = categoryIcons[resource.category]

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden",
        resource.featured && "ring-2 ring-purple-500/20 border-purple-200",
        className
      )}
    >
      {(resource.featured || badge) && (
        <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 text-xs font-medium">
          {badge?.text ?? '⭐ Preporučeno'}
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Icon className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                {resource.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  typeColors[resource.type]
                )}>
                  {resource.type === 'besplatno' && <span>💚 Besplatno</span>}
                  {resource.type === 'placeno' && <span>💰 Plaćeno</span>}
                  {resource.type === 'freemium' && <span>🔀 Freemium</span>}
                </span>
                <span className="text-xs text-gray-500">
                  {languageLabels[resource.language]}
                </span>
              </div>
            </div>
          </div>
          {resource.rating && (
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">{resource.rating}</span>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-4 line-clamp-3">
          {resource.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs font-medium capitalize">
            {resource.category}
          </span>
          {resource.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
            >
              #{tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
              +{resource.tags.length - 3} tagova
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {resource.category === 'sajt' && '🌐 Web sajt'}
            {resource.category === 'alat' && '🛠️ Alat'}
            {resource.category === 'kurs' && '📚 Kurs'}
            {resource.category === 'blog' && '✍️ Blog'}
            {resource.category === 'podcast' && '🎧 Podcast'}
            {resource.category === 'knjiga' && '📖 Knjiga'}
          </div>
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            Otvori
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
