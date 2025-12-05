/**
 * Main Dashboard Page
 * Entry point for the XANDSCOPE application
 */

import { Dashboard } from '@/components/dashboard/dashboard';

export default function HomePage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Section - Compact */}
      <section className="text-center">
        <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-xl font-bold tracking-tight text-transparent sm:text-2xl md:text-3xl">
          Xandeum pNode Analytics
        </h1>
        <p className="mx-auto mt-1 max-w-xl text-xs text-gray-500 sm:mt-2 sm:text-sm">
          Real-time monitoring for the Xandeum storage network
        </p>
      </section>

      {/* Dashboard */}
      <Dashboard />
    </div>
  );
}
