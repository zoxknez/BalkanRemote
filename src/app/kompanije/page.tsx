import React, { Suspense } from 'react'
import KompanijeContent from '@/app/kompanije/KompanijeContent'

export default function KompanijePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}> 
      <KompanijeContent />
    </Suspense>
  )
}
