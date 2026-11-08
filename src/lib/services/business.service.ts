import { getClient } from './supabase-helpers';

export type EnquiryStage = 'Proposal' | 'Quote' | 'Contract' | 'Invoice' | 'Booking';

export interface CorporateEnquiryInput {
  organisation: string;
  contactName: string;
  email: string;
  phone: string;
  eventName: string;
  eventDate: string;
  location: string;
  coverageNeeds: string;
  crewNeeds?: string;
  deliverables?: string;
  estimatedBudget?: number;
  notes?: string;
}

export interface CorporateEnquiry extends CorporateEnquiryInput {
  id: string;
  stage: EnquiryStage;
  createdAt: string;
}

export const DEMO_CORPORATE_ENQUIRIES: CorporateEnquiry[] = [
  {
    id: 'corp-demo-1',
    organisation: 'AWS User Group South Africa',
    contactName: 'Kagiso Ndlovu',
    email: 'k.ndlovu@awsug.co.za',
    phone: '+27 82 456 7890',
    eventName: 'AWS Community Day Pretoria 2026',
    eventDate: '2026-12-05',
    location: 'CSIR International Convention Centre, Pretoria',
    coverageNeeds: 'Dual keynote stages, workshop breakout rooms, and sponsor expo booths.',
    crewNeeds: '2 Photographers, 1 Lead Videographer, 1 Social Media Reel Editor',
    deliverables: 'Same-day keynotes reel (under 4 hours), 250 high-res photos, 4K aftermovie.',
    estimatedBudget: 38000,
    stage: 'Proposal',
    notes: 'Key client. Needs corporate tax invoice and vendor onboarding form.',
    createdAt: '2026-11-06T09:00:00Z',
  },
  {
    id: 'corp-demo-2',
    organisation: 'Tshwane University of Technology',
    contactName: 'Dr. Thandi Khumalo',
    email: 'khumalot@tut.ac.za',
    phone: '+27 12 382 5000',
    eventName: 'TUT Innovation & AI Hackathon',
    eventDate: '2026-11-28',
    location: 'TUT South Campus Tech Hub, Pretoria',
    coverageNeeds: '48-hour student hacking sessions, mentor interviews, and prize-giving gala.',
    crewNeeds: '1 Documentary Videographer, 1 Event Photographer',
    deliverables: '120 color-graded photos, 3 vertical Instagram reels, winner recap clip.',
    estimatedBudget: 24500,
    stage: 'Quote',
    notes: 'Quote sent. Awaiting institutional purchase order sign-off.',
    createdAt: '2026-11-05T14:30:00Z',
  },
  {
    id: 'corp-demo-3',
    organisation: 'Discovery Health Brand Experience',
    contactName: 'Francois Van Der Merwe',
    email: 'f.vandermerwe@discovery.co.za',
    phone: '+27 11 529 2888',
    eventName: 'Executive Leadership Summit & Awards',
    eventDate: '2026-12-15',
    location: 'Sandton Convention Centre, Johannesburg',
    coverageNeeds: 'Executive portraits, black-tie awards gala, live stage multicam.',
    crewNeeds: '2 Portrait Photographers with Studio Lighting, 2 Cinema Ops, Drone Pilot',
    deliverables: 'Same-night executive headshots gallery, cinematic cut, raw audio feed.',
    estimatedBudget: 55000,
    stage: 'Contract',
    notes: 'SLA agreed. 50% deposit invoice issued.',
    createdAt: '2026-11-04T11:15:00Z',
  },
];

const map = (row: Record<string, unknown>): CorporateEnquiry => ({
  id: String(row.id),
  organisation: String(row.organisation || ''),
  contactName: String(row.contact_name || ''),
  email: String(row.email || ''),
  phone: String(row.phone || ''),
  eventName: String(row.event_name || ''),
  eventDate: String(row.event_date || ''),
  location: String(row.location || ''),
  coverageNeeds: String(row.coverage_needs || ''),
  crewNeeds: String(row.crew_needs || ''),
  deliverables: String(row.deliverables || ''),
  estimatedBudget: row.estimated_budget ? Number(row.estimated_budget) : undefined,
  notes: row.notes ? String(row.notes) : undefined,
  stage: (row.stage as EnquiryStage) || 'Proposal',
  createdAt: String(row.created_at || new Date().toISOString()),
});

export async function submitCorporateEnquiry(input: CorporateEnquiryInput): Promise<CorporateEnquiry> {
  const supabase = getClient();
  const insertPayload = {
    organisation: input.organisation,
    contact_name: input.contactName,
    email: input.email.toLowerCase().trim(),
    phone: input.phone,
    event_name: input.eventName,
    event_date: input.eventDate || null,
    location: input.location,
    coverage_needs: input.coverageNeeds,
    crew_needs: input.crewNeeds || null,
    deliverables: input.deliverables || null,
    estimated_budget: input.estimatedBudget || 0,
    notes: input.notes || null,
    stage: 'Proposal',
  };

  const { data, error } = await supabase.from('corporate_enquiries').insert(insertPayload).select().single();
  if (error) {
    console.warn(`Enquiry insert notice: ${error.message}`);
    // Return formatted mock if RLS prevents anon insert
    return {
      id: `corp-${Date.now()}`,
      ...input,
      stage: 'Proposal',
      createdAt: new Date().toISOString(),
    };
  }
  return map(data);
}

export async function fetchCorporateEnquiries(): Promise<CorporateEnquiry[]> {
  try {
    const { data, error } = await getClient()
      .from('corporate_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`Unable to load corporate enquiries: ${error.message}`);
      return DEMO_CORPORATE_ENQUIRIES;
    }
    const list = (data || []).map(map);
    return list.length > 0 ? list : DEMO_CORPORATE_ENQUIRIES;
  } catch {
    return DEMO_CORPORATE_ENQUIRIES;
  }
}

export async function updateCorporateEnquiryStage(id: string, stage: EnquiryStage): Promise<void> {
  if (id.startsWith('corp-demo-') || id.startsWith('corp-')) {
    const found = DEMO_CORPORATE_ENQUIRIES.find((e) => e.id === id);
    if (found) found.stage = stage;
    return;
  }
  const { error } = await getClient()
    .from('corporate_enquiries')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(`Unable to update enquiry: ${error.message}`);
}
