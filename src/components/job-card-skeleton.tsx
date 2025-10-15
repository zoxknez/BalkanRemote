import { motion } from 'framer-motion'

export function JobCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        {/* Company Logo Skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {/* Title Skeleton */}
          <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
          
          {/* Company Skeleton */}
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-1/2" />
          
          {/* Tags Skeleton */}
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20" />
            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-14" />
          </div>
          
          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-4/6" />
          </div>
        </div>
        
        {/* Action Button Skeleton */}
        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
      </div>
    </motion.div>
  )
}

export function JobCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <JobCardSkeleton key={index} />
      ))}
    </div>
  )
}

