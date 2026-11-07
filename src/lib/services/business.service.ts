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
}

export interface CorporateEnquiry extends CorporateEnquiryInput {
  id: string;
  stage: EnquiryStage;
  createdAt: string;
}

const map = (row: Record<string, unknown>): CorporateEnquiry => ({
  id: String(row.id), organisation: String(row.organisation || ''), contactName: String(row.contact_name || ''), email: String(row.email || ''), phone: String(row.phone || ''), eventName: String(row.event_name || ''), eventDate: String(row.event_date || ''), location: String(row.location || ''), coverageNeeds: String(row.coverage_needs || ''), crewNeeds: String(row.crew_needs || ''), deliverables: String(row.deliverables || ''), stage: (row.stage as EnquiryStage) || 'Proposal', createdAt: String(row.created_at || new Date().toISOString()),
});

export async function submitCorporateEnquiry(input: CorporateEnquiryInput): Promise<CorporateEnquiry> {
  const { data, error } = await getClient().from('corporate_enquiries').insert({
    organisation: input.organisation, contact_name: input.contactName, email: input.email, phone: input.phone,
    event_name: input.eventName, event_date: input.eventDate || null, location: input.location, coverage_needs: input.coverageNeeds,
    crew_needs: input.crewNeeds || null, deliverables: input.deliverables || null, stage: 'Proposal',
  }).select().single();
  if (error) throw new Error(`Unable to send your brief: ${error.message}`);
  return map(data);
}

export async function fetchCorporateEnquiries(): Promise<CorporateEnquiry[]> {
  const { data, error } = await getClient().from('corporate_enquiries').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(`Unable to load corporate enquiries: ${error.message}`);
  return (data || []).map(map);
}

export async function updateCorporateEnquiryStage(id: string, stage: EnquiryStage): Promise<void> {
  const { error } = await getClient().from('corporate_enquiries').update({ stage, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Unable to update enquiry: ${error.message}`);
}
