import type { BookingStatus, EventType } from './types';

export const EVENT_TYPES: EventType[] = [
  'Wedding',
  'Funeral',
  'Birthday',
  'Graduation',
  'Groove',
  'Corporate Event',
];

export const BOOKING_STATUS_ORDER: BookingStatus[] = [
  'Submitted',
  'Under Review',
  'Approved',
  'Scheduled',
  'Event Completed',
  'Gallery Uploaded',
  'Delivered',
];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  Submitted: 'Submitted',
  'Under Review': 'Under Review',
  Approved: 'Approved',
  Scheduled: 'Scheduled',
  'Event Completed': 'Event Completed',
  'Gallery Uploaded': 'Gallery Uploaded',
  Delivered: 'Delivered',
  Rejected: 'Rejected',
};

export const PACKAGES = [
  {
    id: 'pkg-essential',
    slug: 'essential',
    tier: 'Essential',
    name: 'Essential Memories',
    price: 5500,
  },
  {
    id: 'pkg-cinematic',
    slug: 'cinematic',
    tier: 'Cinematic',
    name: 'Cinematic Experience',
    price: 8900,
  },
  {
    id: 'pkg-legacy',
    slug: 'legacy',
    tier: 'Legacy',
    name: 'Legacy Collection',
    price: 14500,
  },
] as const;

export const BOOKING_ADDONS = [
  { id: 'addon-drone', name: 'Drone Coverage', price: 2500 },
  { id: 'addon-extra-hour', name: 'Extra Hour Coverage', price: 1200 },
  { id: 'addon-second-photographer', name: 'Second Photographer', price: 1800 },
  { id: 'addon-highlight-reel', name: 'Highlight Reel', price: 3500 },
  { id: 'addon-rush', name: 'Rush Delivery (48hr)', price: 1500 },
] as const;

export function getPackageById(id: string) {
  return PACKAGES.find((p) => p.id === id || p.slug === id);
}

export function getPackageBySlug(slug: string) {
  return PACKAGES.find((p) => p.slug === slug);
}

export function calculateBookingTotal(
  packagePrice: number,
  addons: { price: number }[]
): number {
  return packagePrice + addons.reduce((sum, a) => sum + a.price, 0);
}
