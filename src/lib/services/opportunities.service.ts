import { getClient } from './supabase-helpers';

export type OpportunityStatus = 'Draft' | 'Open' | 'Closed';
export type OutreachStage = 'Prospect' | 'Contacted' | 'Conversation' | 'Proposal' | 'Negotiation' | 'Won' | 'Delivered';

export interface Opportunity {
  id: string;
  title: string;
  organisation: string;
  location: string;
  eventDate: string | null;
  role: string;
  scope: string;
  deliverables: string;
  compensation?: number;
  status: OpportunityStatus;
  createdAt: string;
}

export const DEMO_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: 'TUT Annual Spring Graduation Ceremony',
    organisation: 'Tshwane University of Technology',
    location: 'Pretoria Main Campus, Gauteng',
    eventDate: '2026-10-24',
    role: 'Lead Portrait & Stage Photographer',
    scope: 'Conferring stage coverage, chancellor VIP handshakes, student studio portrait stations, and academic procession.',
    deliverables: '150 color-graded high-resolution portrait exports within 48 hours for immediate student download.',
    compensation: 3500,
    status: 'Open',
    createdAt: new Date().toISOString()
  },
  {
    id: 'opp-2',
    title: 'Gauteng Tech Leaders Summit 2026',
    organisation: 'Sandton TechBridge Africa',
    location: 'Sandton Convention Centre, Johannesburg',
    eventDate: '2026-11-14',
    role: 'Cinematographer & FPV Drone Pilot',
    scope: 'Multi-track stage recording, executive keynote lighting, sponsor booth interactions, and high-altitude exhibition hall drone sweeps.',
    deliverables: '3-minute 4K cinematic sizzle cut, 3 vertical social reels (9:16) delivered same night for LinkedIn/X.',
    compensation: 6500,
    status: 'Open',
    createdAt: new Date().toISOString()
  },
  {
    id: 'opp-3',
    title: 'AWS Community Day South Africa',
    organisation: 'AWS User Group South Africa',
    location: 'CSIR International Convention Centre, Pretoria',
    eventDate: '2026-12-05',
    role: 'Executive Conference Photographer',
    scope: 'Capture 600+ builders across 3 breakout tracks, keynote auditorium dynamics, sponsor pavilion networking, and speaker headshots.',
    deliverables: '120 color-corrected high-res images delivered by 08:00 following morning for press release.',
    compensation: 4800,
    status: 'Open',
    createdAt: new Date().toISOString()
  }
];

const map = (row: Record<string, unknown>): Opportunity => ({
  id: String(row.id),
  title: String(row.title || ''),
  organisation: String(row.organisation || ''),
  location: String(row.location || ''),
  eventDate: row.event_date ? String(row.event_date) : null,
  role: String(row.role || ''),
  scope: String(row.scope || ''),
  deliverables: String(row.deliverables || ''),
  compensation: Number(row.compensation || 0),
  status: (row.status as OpportunityStatus) || 'Draft',
  createdAt: String(row.created_at || new Date().toISOString()),
});

export async function fetchOpenOpportunities(): Promise<Opportunity[]> {
  try {
    const { data, error } = await getClient()
      .from('creative_opportunities')
      .select('*')
      .eq('status', 'Open')
      .order('event_date', { ascending: true, nullsFirst: false });
    if (error) {
      console.warn(`Unable to load opportunities from Supabase: ${error.message}`);
      return DEMO_OPPORTUNITIES.filter((o) => o.status === 'Open');
    }
    const list = (data || []).map(map);
    return list.length > 0 ? list : DEMO_OPPORTUNITIES.filter((o) => o.status === 'Open');
  } catch {
    return DEMO_OPPORTUNITIES.filter((o) => o.status === 'Open');
  }
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  try {
    const { data, error } = await getClient()
      .from('creative_opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn(`Unable to load opportunities: ${error.message}`);
      return DEMO_OPPORTUNITIES;
    }
    const list = (data || []).map(map);
    return list.length > 0 ? list : DEMO_OPPORTUNITIES;
  } catch {
    return DEMO_OPPORTUNITIES;
  }
}

export async function saveOpportunity(
  input: Omit<Opportunity, 'id' | 'createdAt'> & { id?: string }
): Promise<Opportunity> {
  const payload = {
    title: input.title,
    organisation: input.organisation,
    location: input.location,
    event_date: input.eventDate || null,
    role: input.role,
    scope: input.scope,
    deliverables: input.deliverables,
    compensation: input.compensation || 0,
    status: input.status,
    updated_at: new Date().toISOString(),
  };
  try {
    const query = input.id
      ? getClient().from('creative_opportunities').update(payload).eq('id', input.id)
      : getClient().from('creative_opportunities').insert(payload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return map(data);
  } catch (err: any) {
    console.warn('saveOpportunity fallback to local demo list:', err?.message);
    const mock: Opportunity = {
      id: input.id || `opp-${Date.now()}`,
      title: input.title,
      organisation: input.organisation,
      location: input.location,
      eventDate: input.eventDate || null,
      role: input.role,
      scope: input.scope,
      deliverables: input.deliverables,
      compensation: input.compensation || 0,
      status: input.status,
      createdAt: new Date().toISOString()
    };
    DEMO_OPPORTUNITIES.unshift(mock);
    return mock;
  }
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<void> {
  const { error } = await getClient().from('creative_opportunities').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Unable to update opportunity: ${error.message}`);
}

export interface OutreachRecord {
  id: string;
  organisation: string;
  sector: string;
  contactName: string;
  contactEmail: string;
  stage: OutreachStage;
  notes: string;
}

export const DEMO_OUTREACH: OutreachRecord[] = [
  {
    id: 'out-1',
    organisation: 'AWS Community Day South Africa',
    sector: 'Cloud & Tech Hyperscaler',
    contactName: 'Kagiso Ndlovu',
    contactEmail: 'k.ndlovu@awsug.co.za',
    stage: 'Proposal',
    notes: 'CSIR Convention Centre booking for 600 attendees. Quoting multi-camera + 4h same-day reel.'
  },
  {
    id: 'out-2',
    organisation: 'Tshwane University of Technology',
    sector: 'Higher Education & Innovation',
    contactName: 'Prof. S. Radebe',
    contactEmail: 'radebes@tut.ac.za',
    stage: 'Conversation',
    notes: 'Discussing annual graduation ceremony media contract covering all 6 campuses.'
  },
  {
    id: 'out-3',
    organisation: 'Google Developer Groups Johannesburg',
    sector: 'Developer Communities',
    contactName: 'Lerato Moloi',
    contactEmail: 'lerato@gdgjhb.com',
    stage: 'Contacted',
    notes: 'DevFest 2026 coverage lead. Follow-up meeting scheduled for Thursday.'
  },
  {
    id: 'out-4',
    organisation: 'Standard Bank Incubator',
    sector: 'Banking & Startups',
    contactName: 'Nicolette Botha',
    contactEmail: 'nicolette.botha@standardbank.co.za',
    stage: 'Negotiation',
    notes: 'Fintech Demo Day and quarterly founder portraits. Agreement sent.'
  }
];

export async function fetchOutreach(): Promise<OutreachRecord[]> {
  try {
    const { data, error } = await getClient()
      .from('outreach_crm')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn(`Unable to load outreach CRM: ${error.message}`);
      return DEMO_OUTREACH;
    }
    const list = (data || []).map((row) => ({
      id: String(row.id),
      organisation: String(row.organisation || ''),
      sector: String(row.sector || ''),
      contactName: String(row.contact_name || ''),
      contactEmail: String(row.contact_email || ''),
      stage: (row.stage as OutreachStage) || 'Prospect',
      notes: String(row.notes || '')
    }));
    return list.length > 0 ? list : DEMO_OUTREACH;
  } catch {
    return DEMO_OUTREACH;
  }
}

export async function saveOutreach(input: Omit<OutreachRecord, 'id'> & { id?: string }): Promise<OutreachRecord> {
  const payload = {
    organisation: input.organisation,
    sector: input.sector,
    contact_name: input.contactName,
    contact_email: input.contactEmail,
    stage: input.stage,
    notes: input.notes,
    updated_at: new Date().toISOString()
  };
  try {
    const query = input.id
      ? getClient().from('outreach_crm').update(payload).eq('id', input.id)
      : getClient().from('outreach_crm').insert(payload);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return {
      id: String(data.id),
      organisation: String(data.organisation || ''),
      sector: String(data.sector || ''),
      contactName: String(data.contact_name || ''),
      contactEmail: String(data.contact_email || ''),
      stage: (data.stage as OutreachStage) || 'Prospect',
      notes: String(data.notes || '')
    };
  } catch (e: any) {
    console.warn('saveOutreach fallback:', e.message);
    const mock: OutreachRecord = {
      id: input.id || `out-${Date.now()}`,
      ...input
    };
    DEMO_OUTREACH.unshift(mock);
    return mock;
  }
}
