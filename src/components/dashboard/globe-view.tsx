/**
 * Interactive 3D Globe Component
 * Displays pNode geographic distribution (Coming Soon)
 */

'use client';

import { useRef, useEffect, useState, useCallback, MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';
import { Globe2, Loader2, MapPin, Sparkles } from 'lucide-react';
import type { GlobeMethods } from 'react-globe.gl';

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), {
  ssr: false,
  loading: () => <GlobeLoader />,
});

function GlobeLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        <p className="text-sm text-gray-400">Loading globe...</p>
      </div>
    </div>
  );
}

interface GlobeViewProps {
  className?: string;
}

export function GlobeView({ className }: GlobeViewProps) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined) as MutableRefObject<GlobeMethods | undefined>;
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  // Handle container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Configure globe controls after it's ready
  const handleGlobeReady = useCallback(() => {
    setGlobeReady(true);
    if (globeRef.current) {
      const controls = globeRef.current.controls() as { autoRotate: boolean };
      controls.autoRotate = true;
    }
  }, []);

  // Pause rotation on hover
  useEffect(() => {
    if (globeRef.current && globeReady) {
      const controls = globeRef.current.controls() as { autoRotate: boolean };
      controls.autoRotate = !isHovered;
    }
  }, [isHovered, globeReady]);

  // Sample placeholder points (will be replaced with real data)
  const placeholderPoints: never[] = [];

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-black',
        className
      )}
      style={{ minHeight: '500px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Globe */}
      {dimensions.width > 0 && (
        <Globe
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          atmosphereColor="#f59e0b"
          atmosphereAltitude={0.15}
          pointsData={placeholderPoints}
          pointAltitude={0.01}
          pointColor={() => '#f59e0b'}
          pointRadius={0.5}
          pointsMerge={true}
          onGlobeReady={handleGlobeReady}
          animateIn={true}
        />
      )}

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
        <div className="flex flex-col items-center gap-6 p-8 text-center">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20" />
            <div className="relative rounded-full bg-gradient-to-br from-amber-400 to-orange-600 p-6">
              <Globe2 className="h-12 w-12 text-black" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <h3 className="text-2xl font-bold text-white">Geographic View</h3>
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <p className="text-lg font-medium text-amber-400">Coming Soon</p>
          </div>

          {/* Description */}
          <p className="max-w-md text-sm text-gray-400">
            Interactive 3D visualization of pNode distribution across the globe.
            See real-time node locations, regional statistics, and network coverage.
          </p>

          {/* Feature Preview */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <MapPin className="mx-auto mb-2 h-5 w-5 text-amber-500" />
              <p className="text-xs text-gray-400">Node Locations</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <Globe2 className="mx-auto mb-2 h-5 w-5 text-amber-500" />
              <p className="text-xs text-gray-400">Regional Stats</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-amber-500" />
              <p className="text-xs text-gray-400">Live Updates</p>
            </div>
          </div>

          {/* Note */}
          <p className="mt-4 text-xs text-gray-500">
            Geographic data will be available once pNodes expose location information
          </p>
        </div>
      </div>

      {/* Interactive hint */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-xs text-gray-400 backdrop-blur-sm">
        <Globe2 className="h-4 w-4" />
        <span>Drag to rotate • Scroll to zoom</span>
      </div>
    </div>
  );
}

