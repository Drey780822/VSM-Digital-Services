import { getClient } from './supabase-helpers';
import { OFFICIAL_PACKAGES, type PackageRecord } from './packages.service';

export type CommercialModel = 'hourly' | 'package' | 'quotation';
export type MediaType = 'photo' | 'video' | 'both';

export interface EventTypeRecord {
  id: string;
  slug: string;
  name: string;
  commercialModel: CommercialModel;
  description: string;
  minHours: number;
  baseHourlyRate: number;
  baseDeliverables: { photos: number; videos: number };
  displayOrder: number;
  isActive: boolean;
}

export interface PricingAddonRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  unit: 'flat' | 'per_hour' | 'per_unit';
  applicableModels: CommercialModel[];
  isActive: boolean;
  displayOrder: number;
}

export interface GlobalPricingEngineConfig {
  hourlyRate: number;
  baseHours: number;
  minimumHours: number;
  financeThreshold: number;
  paymentMethods: {
    eft: boolean;
    cash: boolean;
    yoco: boolean;
    payfast: boolean;
  };
  vaultPlans: {
    id: string;
    name: string;
    price: number;
    label: string;
  }[];
}

// Canonical source of truth for all 16 South African Event Categories
export const CANONICAL_EVENT_TYPES: EventTypeRecord[] = [
  {
    id: 'evt-birthday',
    slug: 'birthday',
    name: 'Birthday Party',
    commercialModel: 'hourly',
    description: 'Flexible hourly coverage for milestone birthdays and intimate celebrations.',
    minHours: 1,
    baseHourlyRate: 400,
    baseDeliverables: { photos: 80, videos: 2 },
    displayOrder: 1,
    isActive: true,
  },
  {
    id: 'evt-baby-shower',
    slug: 'baby-shower',
    name: 'Baby Shower',
    commercialModel: 'hourly',
    description: 'Warm, candid moments celebrating new life and family love.',
    minHours: 1,
    baseHourlyRate: 400,
    baseDeliverables: { photos: 80, videos: 2 },
    displayOrder: 2,
    isActive: true,
  },
  {
    id: 'evt-graduation',
    slug: 'graduation',
    name: 'Graduation Shoot',
    commercialModel: 'hourly',
    description: 'Celebrate your academic milestone with sharp portraits and family captures.',
    minHours: 1,
    baseHourlyRate: 400,
    baseDeliverables: { photos: 80, videos: 2 },
    displayOrder: 3,
    isActive: true,
  },
  {
    id: 'evt-pool-party',
    slug: 'pool-party',
    name: 'Pool Party',
    commercialModel: 'hourly',
    description: 'Vibrant, high-energy summer captures and highlight reels.',
    minHours: 2,
    baseHourlyRate: 400,
    baseDeliverables: { photos: 100, videos: 2 },
    displayOrder: 4,
    isActive: true,
  },
  {
    id: 'evt-groove',
    slug: 'groove',
    name: 'Groove & Nightlife',
    commercialModel: 'hourly',
    description: 'Cinematic club and social gathering coverage with fast turnaround reels.',
    minHours: 2,
    baseHourlyRate: 450,
    baseDeliverables: { photos: 100, videos: 3 },
    displayOrder: 5,
    isActive: true,
  },
  {
    id: 'evt-overnight-event',
    slug: 'overnight-event',
    name: 'Overnight Event',
    commercialModel: 'hourly',
    description: 'Extended coverage for weekend retreats, camps, and multi-hour festivities.',
    minHours: 4,
    baseHourlyRate: 400,
    baseDeliverables: { photos: 150, videos: 4 },
    displayOrder: 6,
    isActive: true,
  },
  {
    id: 'evt-private-party',
    slug: 'private-party',
    name: 'Private Dinner / Party',
    commercialModel: 'hourly',
    description: 'Understated, elegant coverage for anniversaries and private family gatherings.',
    minHours: 1,
    baseHourlyRate: 400,
    baseDeliverables: { photos: 80, videos: 2 },
    displayOrder: 7,
    isActive: true,
  },
  {
    id: 'evt-wedding',
    slug: 'wedding',
    name: 'Wedding Production',
    commercialModel: 'package',
    description: 'Comprehensive cinematic packages with fixed deposit reserve.',
    minHours: 4,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 200, videos: 1 },
    displayOrder: 8,
    isActive: true,
  },
  {
    id: 'evt-funeral',
    slug: 'funeral',
    name: 'Funeral Memorial',
    commercialModel: 'package',
    description: 'Respectful, solemn legacy documentation honoring life and family heritage.',
    minHours: 4,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 150, videos: 1 },
    displayOrder: 9,
    isActive: true,
  },
  {
    id: 'evt-corporate',
    slug: 'corporate',
    name: 'Corporate Gathering',
    commercialModel: 'quotation',
    description: 'Enterprise-grade visual production and bespoke quotation.',
    minHours: 2,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 0, videos: 0 },
    displayOrder: 10,
    isActive: true,
  },
  {
    id: 'evt-summit',
    slug: 'summit',
    name: 'Tech & Business Summit',
    commercialModel: 'quotation',
    description: 'Multi-camera keynotes, sponsor highlights, and rapid social media delivery.',
    minHours: 4,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 0, videos: 0 },
    displayOrder: 11,
    isActive: true,
  },
  {
    id: 'evt-conference',
    slug: 'conference',
    name: 'Academic / Industry Conference',
    commercialModel: 'quotation',
    description: 'Stage coverage, breakout sessions, attendee portraits, and executive recap video.',
    minHours: 4,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 0, videos: 0 },
    displayOrder: 12,
    isActive: true,
  },
  {
    id: 'evt-hackathon',
    slug: 'hackathon',
    name: 'Hackathon / Innovation Showcase',
    commercialModel: 'quotation',
    description: 'Fast-paced storytelling, developer spotlights, pitching stages, and award reels.',
    minHours: 6,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 0, videos: 0 },
    displayOrder: 13,
    isActive: true,
  },
  {
    id: 'evt-awards',
    slug: 'awards',
    name: 'Gala Dinner & Awards Ceremony',
    commercialModel: 'quotation',
    description: 'Red carpet step-and-repeat, stage presentations, and immediate PR assets.',
    minHours: 4,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 0, videos: 0 },
    displayOrder: 14,
    isActive: true,
  },
  {
    id: 'evt-brand-activation',
    slug: 'brand-activation',
    name: 'Brand Activation / Pop-up',
    commercialModel: 'quotation',
    description: 'High-impact customer engagement, experiential recap films, and vertical reels.',
    minHours: 3,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 0, videos: 0 },
    displayOrder: 15,
    isActive: true,
  },
  {
    id: 'evt-product-launch',
    slug: 'product-launch',
    name: 'Product Launch Event',
    commercialModel: 'quotation',
    description: 'Cinematic product unveiling, media-ready photo packs, and press cutdowns.',
    minHours: 3,
    baseHourlyRate: 0,
    baseDeliverables: { photos: 0, videos: 0 },
    displayOrder: 16,
    isActive: true,
  },
];

// Canonical Addons Catalog
export const CANONICAL_ADDONS: PricingAddonRecord[] = [
  {
    id: 'addon-photos-50',
    slug: 'photos-50',
    name: '50 Extra Edited Photos',
    description: 'Additional professionally retouched high-resolution images.',
    price: 300,
    unit: 'flat',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 'addon-photos-100',
    slug: 'photos-100',
    name: '100 Extra Edited Photos',
    description: 'Comprehensive extended photo collection.',
    price: 550,
    unit: 'flat',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 'addon-reel-30',
    slug: 'reel-30',
    name: '30s Social Media Reel',
    description: 'Punchy vertical video highlight optimized for Instagram & TikTok.',
    price: 500,
    unit: 'flat',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 3,
  },
  {
    id: 'addon-reel-60',
    slug: 'reel-60',
    name: '60s Cinematic Reel',
    description: 'Story-driven cinematic highlight with licensed soundtrack.',
    price: 900,
    unit: 'flat',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 4,
  },
  {
    id: 'addon-same-day',
    slug: 'same-day-preview',
    name: 'Same-Day Preview (10 Photos)',
    description: 'Delivered within 6 hours of shooting for instant social sharing.',
    price: 750,
    unit: 'flat',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 5,
  },
  {
    id: 'addon-delivery-24h',
    slug: 'delivery-24h',
    name: '24-Hour Express Delivery',
    description: 'Fast-tracked editing pipeline for your full album.',
    price: 500,
    unit: 'flat',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 6,
  },
  {
    id: 'addon-raw-footage',
    slug: 'raw-footage',
    name: 'Unedited RAW Footage & Photos',
    description: 'Complete raw media archive transferred via private drive link.',
    price: 1000,
    unit: 'flat',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 7,
  },
  {
    id: 'addon-extra-hour',
    slug: 'extra-hour',
    name: 'Extra Coverage Hour',
    description: 'Additional on-site shooting hour with the creative team.',
    price: 400,
    unit: 'per_hour',
    applicableModels: ['hourly', 'package'],
    isActive: true,
    displayOrder: 8,
  },
  {
    id: 'addon-drone',
    slug: 'drone-coverage',
    name: 'Drone Aerial Video & Photo',
    description: 'Certified drone operator capture for stunning aerial views.',
    price: 1000,
    unit: 'flat',
    applicableModels: ['package', 'quotation'],
    isActive: true,
    displayOrder: 9,
  },
  {
    id: 'addon-extra-photographer',
    slug: 'extra-photographer',
    name: 'Additional Lead Photographer',
    description: 'Second shooter to capture candid angles simultaneously.',
    price: 1500,
    unit: 'flat',
    applicableModels: ['package', 'quotation'],
    isActive: true,
    displayOrder: 10,
  },
];

export const DEFAULT_GLOBAL_CONFIG: GlobalPricingEngineConfig = {
  hourlyRate: 400,
  baseHours: 2,
  minimumHours: 1,
  financeThreshold: 3000,
  paymentMethods: {
    eft: true,
    cash: true,
    yoco: false,
    payfast: false,
  },
  vaultPlans: [
    { id: 'included', name: 'Digital Vault', price: 0, label: '60 days included with every booking' },
    { id: 'premium', name: 'Premium Vault', price: 199, label: 'Annual 4K streaming and high-speed archive' },
    { id: 'family', name: 'Family Archive', price: 399, label: 'Annual unlimited RAW backup and legacy preservation' },
  ],
};

// ---------------------------------------------------------------------------
// DATA FETCHERS WITH HYBRID FALLBACKS
// ---------------------------------------------------------------------------

export async function fetchEventTypes(): Promise<EventTypeRecord[]> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('event_types')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return CANONICAL_EVENT_TYPES;
    }

    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      commercialModel: row.commercial_model as CommercialModel,
      description: row.description || '',
      minHours: row.min_hours || 1,
      baseHourlyRate: Number(row.base_hourly_rate) || 400,
      baseDeliverables: row.base_deliverables || { photos: 80, videos: 2 },
      displayOrder: row.display_order || 1,
      isActive: Boolean(row.is_active),
    }));
  } catch {
    return CANONICAL_EVENT_TYPES;
  }
}

export async function fetchPricingAddons(): Promise<PricingAddonRecord[]> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('pricing_addons')
      .select('*')
      .order('display_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return CANONICAL_ADDONS;
    }

    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description || '',
      price: Number(row.price) || 0,
      unit: row.unit || 'flat',
      applicableModels: (row.applicable_models as CommercialModel[]) || ['hourly', 'package'],
      isActive: Boolean(row.is_active),
      displayOrder: row.display_order || 1,
    }));
  } catch {
    return CANONICAL_ADDONS;
  }
}

export async function fetchGlobalPricingConfig(): Promise<GlobalPricingEngineConfig> {
  try {
    const supabase = getClient();
    const { data, error } = await supabase
      .from('product_settings')
      .select('value')
      .eq('setting_key', 'product_config')
      .maybeSingle();

    if (error || !data?.value) {
      return DEFAULT_GLOBAL_CONFIG;
    }

    const val = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return {
      ...DEFAULT_GLOBAL_CONFIG,
      ...val,
      paymentMethods: {
        ...DEFAULT_GLOBAL_CONFIG.paymentMethods,
        ...(val.paymentMethods || {}),
      },
      vaultPlans: val.vaultPlans?.length ? val.vaultPlans : DEFAULT_GLOBAL_CONFIG.vaultPlans,
    };
  } catch {
    return DEFAULT_GLOBAL_CONFIG;
  }
}

// ---------------------------------------------------------------------------
// DYNAMIC PRICING CALCULATION ENGINE
// ---------------------------------------------------------------------------

export interface MiniEventCalculationInput {
  eventTypeSlug: string;
  hours: number;
  mediaType: MediaType; // photo, video, both
  selectedAddonSlugs?: string[];
  deliverableOptionId?: 'photos-50' | 'photos-80' | 'photos-100' | 'photos-150';
}

export interface MiniEventCalculationResult {
  eventType: EventTypeRecord;
  hours: number;
  hourlyRate: number;
  mediaMultiplier: number;
  baseCoverageAmount: number;
  deliverablesSummary: string;
  deliverablesExtraAmount: number;
  addons: {
    slug: string;
    name: string;
    price: number;
  }[];
  addonsTotal: number;
  totalAmount: number;
  depositAmount: number; // 50% deposit for hourly mini-events or min R400
  balanceDue: number;
  isFinancingEligible: boolean;
  estimatedMonthly: number;
}

export function calculateMiniEventPrice(
  input: MiniEventCalculationInput,
  eventTypes: EventTypeRecord[] = CANONICAL_EVENT_TYPES,
  addonsCatalog: PricingAddonRecord[] = CANONICAL_ADDONS,
  financeThreshold: number = 3000
): MiniEventCalculationResult {
  const event =
    eventTypes.find((e) => e.slug === input.eventTypeSlug) ||
    eventTypes.find((e) => e.slug === 'birthday') ||
    CANONICAL_EVENT_TYPES[0];

  const hours = Math.max(input.hours || 1, event.minHours || 1);
  const hourlyRate = event.baseHourlyRate || 400;

  // Media Multiplier
  let mediaMultiplier = 1.0;
  if (input.mediaType === 'video') mediaMultiplier = 1.15;
  if (input.mediaType === 'both') mediaMultiplier = 1.35;

  const baseCoverageAmount = Math.round(hours * hourlyRate * mediaMultiplier);

  // Deliverables description based on hours & media
  let photoCount = event.baseDeliverables?.photos || 80;
  if (hours > 2) photoCount += (hours - 2) * 30;

  let videoCount = event.baseDeliverables?.videos || 2;
  if (hours > 2 && input.mediaType !== 'photo') videoCount += Math.floor((hours - 2) / 2);

  let deliverablesSummary = `${photoCount} edited photos`;
  if (input.mediaType === 'video') {
    deliverablesSummary = `${videoCount} cinematic reels & full video recap`;
  } else if (input.mediaType === 'both') {
    deliverablesSummary = `${photoCount} edited photos + ${videoCount} highlight reels`;
  }

  // Addons calculations
  const selectedSlugs = input.selectedAddonSlugs || [];
  const appliedAddons = addonsCatalog
    .filter((a) => a.isActive && selectedSlugs.includes(a.slug))
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      price: a.unit === 'per_hour' ? a.price * hours : a.price,
    }));

  const addonsTotal = appliedAddons.reduce((sum, item) => sum + item.price, 0);
  const totalAmount = baseCoverageAmount + addonsTotal;

  // Deposit: 50% of total amount or minimum R400
  const depositAmount = Math.max(400, Math.round(totalAmount * 0.5));
  const balanceDue = totalAmount - depositAmount;

  const isFinancingEligible = totalAmount >= financeThreshold;
  // Estimated 6-month monthly repayment if financed (18% APR)
  const estimatedMonthly = isFinancingEligible ? Math.round((totalAmount * 1.12) / 6) : 0;

  return {
    eventType: event,
    hours,
    hourlyRate,
    mediaMultiplier,
    baseCoverageAmount,
    deliverablesSummary,
    deliverablesExtraAmount: 0,
    addons: appliedAddons,
    addonsTotal,
    totalAmount,
    depositAmount,
    balanceDue,
    isFinancingEligible,
    estimatedMonthly,
  };
}

export interface PackageCalculationResult {
  package: PackageRecord;
  addons: {
    slug: string;
    name: string;
    price: number;
  }[];
  addonsTotal: number;
  totalAmount: number;
  depositAmount: number;
  balanceDue: number;
  isFinancingEligible: boolean;
  estimatedMonthly: number;
}

export function calculatePackagePrice(
  pkg: PackageRecord,
  selectedAddonSlugs: string[] = [],
  addonsCatalog: PricingAddonRecord[] = CANONICAL_ADDONS
): PackageCalculationResult {
  const appliedAddons = addonsCatalog
    .filter((a) => a.isActive && selectedAddonSlugs.includes(a.slug))
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      price: a.price,
    }));

  const addonsTotal = appliedAddons.reduce((sum, item) => sum + item.price, 0);
  const totalAmount = pkg.price + addonsTotal;
  const depositAmount = pkg.depositAmount;
  const balanceDue = totalAmount - depositAmount;

  return {
    package: pkg,
    addons: appliedAddons,
    addonsTotal,
    totalAmount,
    depositAmount,
    balanceDue,
    isFinancingEligible: true,
    estimatedMonthly: pkg.estimatedMonthly,
  };
}

// ---------------------------------------------------------------------------
// ADMIN MUTATIONS (Persist to Supabase)
// ---------------------------------------------------------------------------

export async function saveGlobalPricingConfig(
  config: GlobalPricingEngineConfig
): Promise<GlobalPricingEngineConfig> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from('product_settings')
    .upsert(
      {
        setting_key: 'product_config',
        value: config,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'setting_key' }
    )
    .select('value')
    .single();

  if (error) {
    throw new Error(`Failed to update pricing configuration: ${error.message}`);
  }

  return (typeof data.value === 'string' ? JSON.parse(data.value) : data.value) as GlobalPricingEngineConfig;
}

export async function updateEventTypeRate(
  slug: string,
  updates: Partial<EventTypeRecord>
): Promise<void> {
  const supabase = getClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.baseHourlyRate !== undefined) payload.base_hourly_rate = updates.baseHourlyRate;
  if (updates.minHours !== undefined) payload.min_hours = updates.minHours;
  if (updates.commercialModel !== undefined) payload.commercial_model = updates.commercialModel;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;
  if (updates.description !== undefined) payload.description = updates.description;

  const { error } = await supabase.from('event_types').update(payload).eq('slug', slug);
  if (error) throw new Error(`Failed to update event type: ${error.message}`);
}

export async function updatePricingAddon(
  slug: string,
  updates: Partial<PricingAddonRecord>
): Promise<void> {
  const supabase = getClient();
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.price !== undefined) payload.price = updates.price;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.isActive !== undefined) payload.is_active = updates.isActive;

  const { error } = await supabase.from('pricing_addons').update(payload).eq('slug', slug);
  if (error) throw new Error(`Failed to update pricing addon: ${error.message}`);
}
