import { getClient } from './supabase-helpers';

export interface PackageRecord {
  id: string;
  name: string;
  slug: string;
  tier: string;
  category: string;
  description: string;
  price: number;
  depositAmount: number;
  durationHours: number;
  features: string[];
  isActive: boolean;
  isHighlighted: boolean;
  displayOrder: number;
  financingAvailable: boolean;
  estimatedMonthly: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePackageInput {
  name: string;
  slug?: string;
  tier?: string;
  category?: string;
  description?: string;
  price: number;
  depositAmount?: number;
  durationHours?: number;
  features: string[];
  isActive?: boolean;
  isHighlighted?: boolean;
  displayOrder?: number;
  financingAvailable?: boolean;
}

// Canonical source of truth for the 3 official VSM Packages
export const OFFICIAL_PACKAGES: PackageRecord[] = [
  {
    id: 'pkg-essential',
    name: 'Essential Memories',
    slug: 'essential-memories',
    tier: 'Essential',
    category: 'Photography & Video',
    description: 'Perfect for intimate ceremonies and major family gatherings where every moment matters. Complete high-definition coverage, rapid turnaround, and private digital delivery.',
    price: 5500,
    depositAmount: 1500,
    durationHours: 4,
    features: [
      'Professional event photography',
      'Full event video (HD)',
      'Private online gallery',
      'Basic professional edits',
      '100+ edited photos delivered',
      '4 hours dedicated coverage',
      'Memory Vault digital download',
      'Rapid 5-day delivery SLA',
    ],
    isActive: true,
    isHighlighted: false,
    displayOrder: 1,
    financingAvailable: true,
    estimatedMonthly: 750,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pkg-cinematic',
    name: 'Cinematic Experience',
    slug: 'cinematic-experience',
    tier: 'Cinematic',
    category: 'Photography & Cinema',
    description: 'The complete cinematic production for unforgettable celebrations. 4K visuals, drone aerial video, and signature Memory Vault delivery.',
    price: 8900,
    depositAmount: 2500,
    durationHours: 8,
    features: [
      'Professional event photography',
      'Full cinematic event video (4K)',
      'Drone aerial video coverage',
      'Drone high-resolution photography',
      'Cinematic color grading & edits',
      'Private Memory Vault gallery',
      '200+ edited photos delivered',
      '8 hours dedicated coverage',
      'Same-day preview teaser',
    ],
    isActive: true,
    isHighlighted: true,
    displayOrder: 2,
    financingAvailable: true,
    estimatedMonthly: 1480,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pkg-legacy',
    name: 'Legacy Collection',
    slug: 'legacy-collection',
    tier: 'Legacy',
    category: 'Complete Luxury Production',
    description: 'The ultimate visual heirloom. Full-day multi-camera master crew, heirloom album, lifetime vault preservation, and cinematic documentary.',
    price: 14500,
    depositAmount: 4000,
    durationHours: 12,
    features: [
      '2 senior photographers + 1 filmmaker',
      'Full day dedicated coverage (12 hours)',
      'Drone 4K aerial photography & video',
      '350+ master-retouched photos',
      '10-15 minute cinematic documentary film',
      '60-second social media reel',
      'Same-day teaser photo delivery',
      'Luxury leather-bound physical photo album',
      'Lifetime Memory Vault digital preservation',
    ],
    isActive: true,
    isHighlighted: false,
    displayOrder: 3,
    financingAvailable: true,
    estimatedMonthly: 2420,
    createdAt: new Date().toISOString(),
  },
];

export function calculateEstimatedMonthly(price: number, term = 6, annualRate = 18.0): number {
  if (!price || price <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, term);
  return Math.round((price * monthlyRate * factor) / (factor - 1));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPackage(row: Record<string, any>): PackageRecord {
  const price = Number(row.price ?? 0);
  const depositAmount = Number(row.deposit_amount ?? Math.round(price * 0.4));
  const features = Array.isArray(row.features)
    ? row.features
    : typeof row.features === 'string'
      ? JSON.parse(row.features || '[]')
      : [];

  const estMonthly = calculateEstimatedMonthly(price, 6, 18.0);

  return {
    id: row.id,
    name: row.name || 'Photography Package',
    slug: row.slug || row.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || row.id,
    tier: row.tier || (price >= 14000 ? 'Legacy' : price >= 8000 ? 'Cinematic' : 'Essential'),
    category: row.category || 'Photography',
    description: row.description || '',
    price,
    depositAmount,
    durationHours: Number(row.duration_hours || 4),
    features,
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    isHighlighted: Boolean(row.is_highlighted),
    displayOrder: Number(row.display_order ?? row.order_index ?? 1),
    financingAvailable: row.financing_available !== undefined ? Boolean(row.financing_available) : true,
    estimatedMonthly: estMonthly,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function fetchPackages(activeOnly = true): Promise<PackageRecord[]> {
  try {
    const supabase = getClient();
    let query = supabase.from('packages').select('*').order('display_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return activeOnly ? OFFICIAL_PACKAGES.filter((p) => p.isActive) : OFFICIAL_PACKAGES;
    }

    const mapped = data.map(mapPackage);
    // Combine with canonical packages if any official ones are not yet in the DB
    const canonicalMissing = OFFICIAL_PACKAGES.filter(
      (cp) => !mapped.some((p) => p.slug === cp.slug || p.name.toLowerCase() === cp.name.toLowerCase())
    );
    const combined = [...mapped, ...(activeOnly ? canonicalMissing.filter((p) => p.isActive) : canonicalMissing)];
    return combined.sort((a, b) => a.displayOrder - b.displayOrder);
  } catch {
    return activeOnly ? OFFICIAL_PACKAGES.filter((p) => p.isActive) : OFFICIAL_PACKAGES;
  }
}

export async function getPackageById(id: string): Promise<PackageRecord | null> {
  const all = await fetchPackages(false);
  const found = all.find((p) => p.id === id || p.slug === id);
  if (found) return found;

  try {
    const supabase = getClient();
    const { data, error } = await supabase.from('packages').select('*').eq('id', id).maybeSingle();
    if (!error && data) return mapPackage(data);
  } catch {
    // fallback
  }

  return OFFICIAL_PACKAGES.find((p) => p.id === id || p.slug === id) || null;
}

export async function createPackage(input: CreatePackageInput): Promise<PackageRecord> {
  const supabase = getClient();
  const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const now = new Date().toISOString();

  const insertRow = {
    name: input.name,
    slug,
    tier: input.tier || 'Custom',
    category: input.category || 'Photography',
    description: input.description || '',
    price: input.price,
    deposit_amount: input.depositAmount ?? Math.round(input.price * 0.4),
    duration_hours: input.durationHours || 4,
    features: input.features || [],
    is_active: input.isActive ?? true,
    is_highlighted: input.isHighlighted ?? false,
    display_order: input.displayOrder ?? 1,
    financing_available: input.financingAvailable ?? true,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('packages').insert(insertRow).select().single();
  if (error) throw new Error(`Failed to create package: ${error.message}`);

  return mapPackage(data);
}

export async function updatePackage(
  id: string,
  updates: Partial<CreatePackageInput>
): Promise<PackageRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const updateRow: Record<string, unknown> = {
    updated_at: now,
  };

  if (updates.name !== undefined) updateRow.name = updates.name;
  if (updates.slug !== undefined) updateRow.slug = updates.slug;
  if (updates.tier !== undefined) updateRow.tier = updates.tier;
  if (updates.category !== undefined) updateRow.category = updates.category;
  if (updates.description !== undefined) updateRow.description = updates.description;
  if (updates.price !== undefined) updateRow.price = updates.price;
  if (updates.depositAmount !== undefined) updateRow.deposit_amount = updates.depositAmount;
  if (updates.durationHours !== undefined) updateRow.duration_hours = updates.durationHours;
  if (updates.features !== undefined) updateRow.features = updates.features;
  if (updates.isActive !== undefined) updateRow.is_active = updates.isActive;
  if (updates.isHighlighted !== undefined) updateRow.is_highlighted = updates.isHighlighted;
  if (updates.displayOrder !== undefined) updateRow.display_order = updates.displayOrder;
  if (updates.financingAvailable !== undefined) updateRow.financing_available = updates.financingAvailable;

  // Check if id is a fallback synthetic ID (e.g. 'pkg-essential')
  if (id.startsWith('pkg-')) {
    const canonical = OFFICIAL_PACKAGES.find((p) => p.id === id);
    const slug = updates.slug || canonical?.slug;
    if (slug) {
      // Upsert by slug
      const upsertPayload = {
        name: updates.name ?? canonical?.name ?? 'Official Package',
        slug,
        tier: updates.tier ?? canonical?.tier ?? 'Essential',
        category: updates.category ?? canonical?.category ?? 'Photography',
        description: updates.description ?? canonical?.description ?? '',
        price: updates.price ?? canonical?.price ?? 5000,
        deposit_amount: updates.depositAmount ?? canonical?.depositAmount ?? 2000,
        duration_hours: updates.durationHours ?? canonical?.durationHours ?? 4,
        features: updates.features ?? canonical?.features ?? [],
        is_active: updates.isActive ?? canonical?.isActive ?? true,
        is_highlighted: updates.isHighlighted ?? canonical?.isHighlighted ?? false,
        display_order: updates.displayOrder ?? canonical?.displayOrder ?? 1,
        financing_available: updates.financingAvailable ?? canonical?.financingAvailable ?? true,
        updated_at: now,
      };

      const { data, error } = await supabase
        .from('packages')
        .upsert(upsertPayload, { onConflict: 'slug' })
        .select()
        .single();

      if (!error && data) {
        return mapPackage(data);
      }
    }
  }

  const { data, error } = await supabase
    .from('packages')
    .update(updateRow)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update package: ${error.message}`);
  return mapPackage(data);
}

export async function deletePackage(id: string): Promise<void> {
  const supabase = getClient();
  let query = supabase.from('packages').delete();

  if (id.startsWith('pkg-')) {
    const canonical = OFFICIAL_PACKAGES.find((p) => p.id === id);
    if (canonical) {
      query = query.eq('slug', canonical.slug);
    } else {
      query = query.eq('id', id);
    }
  } else {
    query = query.eq('id', id);
  }

  const { error } = await query;
  if (error) throw new Error(`Failed to delete package: ${error.message}`);
}

export async function seedCanonicalPackages(): Promise<PackageRecord[]> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const payloads = OFFICIAL_PACKAGES.map((pkg) => ({
    name: pkg.name,
    slug: pkg.slug,
    tier: pkg.tier,
    category: pkg.category,
    description: pkg.description,
    price: pkg.price,
    deposit_amount: pkg.depositAmount,
    duration_hours: pkg.durationHours,
    features: pkg.features,
    is_active: pkg.isActive,
    is_highlighted: pkg.isHighlighted,
    display_order: pkg.displayOrder,
    financing_available: pkg.financingAvailable,
    updated_at: now,
  }));

  const { data, error } = await supabase
    .from('packages')
    .upsert(payloads, { onConflict: 'slug' })
    .select();

  if (error) {
    throw new Error(`Failed to seed packages: ${error.message}`);
  }

  return (data || []).map(mapPackage);
}

export const fetchActivePackages = (): Promise<PackageRecord[]> => {
  return fetchPackages(true);
};

