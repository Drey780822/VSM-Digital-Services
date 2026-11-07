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
  status: OpportunityStatus;
  createdAt: string;
}

const map = (row: Record<string, unknown>): Opportunity => ({
  id: String(row.id), title: String(row.title || ''), organisation: String(row.organisation || ''), location: String(row.location || ''), eventDate: row.event_date ? String(row.event_date) : null, role: String(row.role || ''), scope: String(row.scope || ''), deliverables: String(row.deliverables || ''), status: (row.status as OpportunityStatus) || 'Draft', createdAt: String(row.created_at || new Date().toISOString()),
});

export async function fetchOpenOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await getClient().from('creative_opportunities').select('*').eq('status', 'Open').order('event_date', { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Unable to load opportunities: ${error.message}`);
  return (data || []).map(map);
}

export async function fetchOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await getClient().from('creative_opportunities').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(`Unable to load opportunities: ${error.message}`);
  return (data || []).map(map);
}

export async function saveOpportunity(input: Omit<Opportunity, 'id' | 'createdAt'> & { id?: string }): Promise<Opportunity> {
  const payload = { title: input.title, organisation: input.organisation, location: input.location, event_date: input.eventDate || null, role: input.role, scope: input.scope, deliverables: input.deliverables, status: input.status, updated_at: new Date().toISOString() };
  const query = input.id ? getClient().from('creative_opportunities').update(payload).eq('id', input.id) : getClient().from('creative_opportunities').insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw new Error(`Unable to save opportunity: ${error.message}`);
  return map(data);
}

export async function updateOpportunityStatus(id: string, status: OpportunityStatus): Promise<void> {
  const { error } = await getClient().from('creative_opportunities').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Unable to update opportunity: ${error.message}`);
}

export interface OutreachRecord { id: string; organisation: string; sector: string; contactName: string; contactEmail: string; stage: OutreachStage; notes: string; }
export async function fetchOutreach(): Promise<OutreachRecord[]> {
  const { data, error } = await getClient().from('outreach_crm').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error(`Unable to load outreach CRM: ${error.message}`);
  return (data || []).map((row) => ({ id: String(row.id), organisation: String(row.organisation || ''), sector: String(row.sector || ''), contactName: String(row.contact_name || ''), contactEmail: String(row.contact_email || ''), stage: (row.stage as OutreachStage) || 'Prospect', notes: String(row.notes || '') }));
}

export async function saveOutreach(input: Omit<OutreachRecord, 'id'> & { id?: string }): Promise<OutreachRecord> {
  const payload = { organisation: input.organisation, sector: input.sector, contact_name: input.contactName, contact_email: input.contactEmail, stage: input.stage, notes: input.notes, updated_at: new Date().toISOString() };
  const query = input.id ? getClient().from('outreach_crm').update(payload).eq('id', input.id) : getClient().from('outreach_crm').insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw new Error(`Unable to save outreach record: ${error.message}`);
  return { id: String(data.id), organisation: String(data.organisation || ''), sector: String(data.sector || ''), contactName: String(data.contact_name || ''), contactEmail: String(data.contact_email || ''), stage: (data.stage as OutreachStage) || 'Prospect', notes: String(data.notes || '') };
}
