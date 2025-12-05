/**
 * Utility functions
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number | null, decimals: number = 2): string {
  if (bytes === null || bytes === 0) return '0 B';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | null, decimals: number = 1): string {
  if (value === null) return 'N/A';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format number with commas
 */
export function formatNumber(value: number | null): string {
  if (value === null) return 'N/A';
  return value.toLocaleString();
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | null): string {
  if (!date) return 'N/A';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Format date to ISO string
 */
export function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  return date.toISOString().split('T')[0];
}

/**
 * Format milliseconds to readable latency
 */
export function formatLatency(ms: number | null): string {
  if (ms === null) return 'N/A';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Truncate a string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Get health color based on score
 */
export function getHealthColor(score: number): string {
  if (score >= 90) return 'text-green-500';
  if (score >= 70) return 'text-lime-500';
  if (score >= 50) return 'text-yellow-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-red-500';
}

/**
 * Get health background color based on score
 */
export function getHealthBgColor(score: number): string {
  if (score >= 90) return 'bg-green-500/20';
  if (score >= 70) return 'bg-lime-500/20';
  if (score >= 50) return 'bg-yellow-500/20';
  if (score >= 30) return 'bg-orange-500/20';
  return 'bg-red-500/20';
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
      return 'text-green-500';
    case 'offline':
      return 'text-red-500';
    case 'degraded':
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
}

/**
 * Get status background color
 */
export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'offline':
      return 'bg-red-500';
    case 'degraded':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}



