import React, { Suspense } from 'react';
import TaxGuideClient from './Client';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}> 
      <TaxGuideClient />
    </Suspense>
  );
}