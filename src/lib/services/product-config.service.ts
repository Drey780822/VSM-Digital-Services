import { getClient } from './supabase-helpers';

export type CommercialModel = 'flexible' | 'production' | 'quote';

export interface ConfigurableAddon {
  id: string;
  name: string;
  price: number;
  models: CommercialModel[];
}

export interface VaultPlan {
  id: string;
  name: string;
  price: number | null;
  label: string;
}

export interface EventPricingRule {
  name: string;
  model: CommercialModel;
  detail: string;
}

export interface ProductConfig {
  hourlyRate: number;
  minimumHours: number;
  financeThreshold: number;
  paymentMethods: { yoco: boolean; payfast: boolean; eft: boolean; cash: boolean };
  deliverables: { id: string; name: string; price: number }[];
  addons: ConfigurableAddon[];
  vaultPlans: VaultPlan[];
  eventRules: EventPricingRule[];
}

// Used only until an administrator saves configuration in product_settings.
export const DEFAULT_PRODUCT_CONFIG: ProductConfig = {
  hourlyRate: 850,
  minimumHours: 1,
  financeThreshold: 5500,
  paymentMethods: { yoco: false, payfast: false, eft: true, cash: true },
  deliverables: [
    { id: 'photos-50', name: '50 edited photos', price: 300 },
    { id: 'reel-30', name: '30-second highlight reel', price: 500 },
    { id: 'reel-60', name: '60-second cinematic reel', price: 900 },
  ],
  addons: [
    { id: 'same-day', name: 'Same-day preview', price: 750, models: ['flexible', 'production'] },
    { id: 'delivery-24', name: '24-hour delivery', price: 500, models: ['flexible', 'production'] },
    { id: 'raw-footage', name: 'Raw footage', price: 1000, models: ['flexible', 'production'] },
    { id: 'extra-hour', name: 'Extra hour', price: 400, models: ['flexible', 'production'] },
    { id: 'drone', name: 'Drone coverage', price: 1000, models: ['production'] },
    { id: 'additional-photographer', name: 'Additional photographer', price: 1500, models: ['production'] },
  ],
  vaultPlans: [
    { id: 'digital', name: 'Digital Vault', price: null, label: 'Included with eligible event delivery' },
    { id: 'premium', name: 'Premium Vault', price: 199, label: 'Annual price configured by VSM' },
    { id: 'family', name: 'Family Archive', price: 399, label: 'Annual price configured by VSM' },
    { id: 'legacy', name: 'Legacy Archive', price: null, label: 'Plan details and price configured by VSM' },
  ],
  eventRules: [
    { name: 'Wedding', model: 'production', detail: 'Premium production packages' },
    { name: 'Funeral', model: 'production', detail: 'Premium production packages' },
    { name: 'Birthday', model: 'flexible', detail: 'Flexible coverage and deliverables' },
    { name: 'Graduation', model: 'flexible', detail: 'Flexible coverage and deliverables' },
    { name: 'Baby shower', model: 'flexible', detail: 'Flexible coverage and deliverables' },
    { name: 'Party', model: 'flexible', detail: 'Flexible coverage and deliverables' },
    { name: 'Pool party', model: 'flexible', detail: 'Flexible coverage and deliverables' },
    { name: 'Groove', model: 'flexible', detail: 'Flexible coverage and deliverables' },
    { name: 'Overnight event', model: 'quote', detail: 'Custom quote required' },
    { name: 'Corporate event', model: 'quote', detail: 'Custom business quote required' },
    { name: 'Something else', model: 'flexible', detail: 'Start with flexible coverage' },
  ],
};

function mergeConfig(value: Partial<ProductConfig> | null | undefined): ProductConfig {
  return {
    ...DEFAULT_PRODUCT_CONFIG,
    ...value,
    paymentMethods: { ...DEFAULT_PRODUCT_CONFIG.paymentMethods, ...(value?.paymentMethods || {}) },
    deliverables: value?.deliverables?.length ? value.deliverables : DEFAULT_PRODUCT_CONFIG.deliverables,
    addons: value?.addons?.length ? value.addons : DEFAULT_PRODUCT_CONFIG.addons,
    vaultPlans: value?.vaultPlans?.length ? value.vaultPlans : DEFAULT_PRODUCT_CONFIG.vaultPlans,
    eventRules: value?.eventRules?.length ? value.eventRules : DEFAULT_PRODUCT_CONFIG.eventRules,
  };
}

export async function fetchProductConfig(): Promise<ProductConfig> {
  try {
    const { data, error } = await getClient().from('product_settings').select('value').eq('setting_key', 'product_config').maybeSingle();
    if (error || !data?.value) return DEFAULT_PRODUCT_CONFIG;
    const value = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
    return mergeConfig(value as Partial<ProductConfig>);
  } catch {
    return DEFAULT_PRODUCT_CONFIG;
  }
}

export async function saveProductConfig(config: ProductConfig): Promise<ProductConfig> {
  const { data, error } = await getClient()
    .from('product_settings')
    .upsert({ setting_key: 'product_config', value: config, updated_at: new Date().toISOString() }, { onConflict: 'setting_key' })
    .select('value')
    .single();
  if (error) throw new Error(`Unable to save product configuration: ${error.message}`);
  return mergeConfig(data.value as Partial<ProductConfig>);
}

export const formatZAR = (amount: number) => `R${amount.toLocaleString('en-ZA')}`;
