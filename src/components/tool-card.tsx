'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Star, Monitor, Smartphone, Globe } from 'lucide-react'
import { Tool } from '@/types'
import { cn } from '@/lib/utils'

interface ToolCardProps {
  tool: Tool
  className?: string
  badge?: { text: string; color?: 'cyan' | 'purple' | 'green' }
}

export function ToolCard({ tool, className, badge }: ToolCardProps) {
  const categoryIcons: Record<Tool['category'], string> = {
    komunikacija: '💬',
    produktivnost: '⚡',
    design: '🎨',
    development: '⚙️',
    'project-management': '📊',
    'time-tracking': '⏱️',
    finance: '💰',
    marketing: '📣',
    security: '🛡️',
    analytics: '📈',
    'ai-tools': '🤖',
    storage: '🗄️',
    automation: '🔁'
  }

  const pricingColors: Record<Tool['pricing'], string> = {
    besplatno: 'bg-green-100 text-green-800',
    placeno: 'bg-red-100 text-red-800',
    freemium: 'bg-blue-100 text-blue-800'
  }

  const categoryLabels: Record<Tool['category'], string> = {
    komunikacija: 'Komunikacija',
    produktivnost: 'Produktivnost',
    design: 'Dizajn',
    development: 'Development',
    'project-management': 'Upravljanje projektima',
    'time-tracking': 'Praćenje vremena',
    finance: 'Finansije',
    marketing: 'Marketing',
    security: 'Bezbednost',
    analytics: 'Analitika',
    'ai-tools': 'AI alati',
    storage: 'Skladištenje',
    automation: 'Automatizacija'
  }

  const platforms = tool.platforms ?? []

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">
            {categoryIcons[tool.category]}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
              {tool.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                pricingColors[tool.pricing]
              )}>
                {tool.pricing === 'besplatno' && '💚 Besplatno'}
                {tool.pricing === 'placeno' && '💰 Plaćeno'}  
                {tool.pricing === 'freemium' && '🔀 Freemium'}
              </span>
              <span className="text-xs text-gray-500">
                {categoryLabels[tool.category]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
        {badge && (
          <div className={cn(
            'mb-2 px-3 py-1 rounded-full text-xs font-medium',
            badge.color === 'cyan' && 'bg-cyan-100 text-cyan-800',
            badge.color === 'purple' && 'bg-purple-100 text-purple-800',
            (!badge.color || badge.color === 'green') && 'bg-green-100 text-green-800'
          )}>{badge.text}</div>
        )}
        {tool.rating && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">{tool.rating}</span>
          </div>
        )}
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">
        {tool.description}
      </p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Ključne funkcije:</h4>
        <div className="flex flex-wrap gap-2">
          {tool.features.slice(0, 4).map((feature) => (
            <span 
              key={feature}
              className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs"
            >
              {feature}
            </span>
          ))}
          {tool.features.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
              +{tool.features.length - 4} više
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          {platforms.includes('Web') && <Globe className="w-4 h-4" />}
          {platforms.includes('Desktop') && <Monitor className="w-4 h-4" />}
          {platforms.includes('Mobile') && <Smartphone className="w-4 h-4" />}
          <span className="text-xs">
            {platforms.length > 0 ? platforms.join(', ') : 'N/A'}
          </span>
        </div>
        
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Isprobaj
          <ExternalLink className="w-4 h-4 ml-1" />
        </a>
      </div>
    </motion.div>
  )
}
