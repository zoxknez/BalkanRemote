'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ExternalLink, MapPin, Users, Star, TrendingUp } from 'lucide-react'
import { Company } from '@/types'
import { cn } from '@/lib/utils'

interface CompanyCardProps {
  company: Company
  className?: string
  badge?: { text: string; color?: 'cyan' | 'purple' | 'green' }
}

export function CompanyCard({ company, className, badge }: CompanyCardProps) {
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
        <div className="flex items-center space-x-4">
          {company.logo && (
            <Image
              src={company.logo}
              alt={company.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="font-semibold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
              {company.name}
            </h3>
            <p className="text-gray-600 text-sm">{company.industry}</p>
            {company.rating && (
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="ml-1 text-sm font-medium">{company.rating}</span>
                <span className="text-gray-500 text-sm ml-1">
                  ({company.reviewCount} recenzija)
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {badge && (
            <div
              className={cn(
                'mb-2 px-3 py-1 rounded-full text-xs font-medium',
                badge.color === 'cyan' && 'bg-cyan-100 text-cyan-800',
                badge.color === 'purple' && 'bg-purple-100 text-purple-800',
                (!badge.color || badge.color === 'green') && 'bg-green-100 text-green-800'
              )}
            >
              {badge.text}
            </div>
          )}
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            company.isHiring 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-600"
          )}>
            {company.isHiring ? '🟢 Zapošljava' : '⭕ Ne zapošljava'}
          </div>
          {company.isHiring && company.openPositions > 0 && (
            <div className="text-sm text-gray-600 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {company.openPositions} pozicija
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">
        {company.description}
      </p>

      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-1" />
          {company.location}
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-1" />
          {company.size}
        </div>
        {company.foundedYear && (
          <div>Osnovana {company.foundedYear}</div>
        )}
      </div>

      {company.techStack && company.techStack.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {company.techStack.slice(0, 5).map((tech) => (
              <span 
                key={tech}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {company.techStack.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
                +{company.techStack.length - 5} više
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {company.benefits.slice(0, 3).map((benefit) => (
            <span 
              key={benefit}
              className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs"
            >
              {benefit}
            </span>
          ))}
          {company.benefits.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs">
              +{company.benefits.length - 3} benefita
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            Website
            <ExternalLink className="w-4 h-4 ml-1" />
          </a>
          {company.linkedin && (
            <a
              href={company.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              LinkedIn
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
