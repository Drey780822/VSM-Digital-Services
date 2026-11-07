import { getClient } from './supabase-helpers';
import { updateBooking, type PaymentStatus } from './bookings.service';

export interface PaymentProof {
  id: string;
  bookingId: string;
  fileName: string;
  fileUrl: string;
  storagePath?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  createdAt: string;
  booking?: { referenceNumber: string; customerName: string; totalAmount: number };
}

const map = (row: Record<string, any>): PaymentProof => ({
  id: String(row.id), bookingId: String(row.booking_id), fileName: String(row.file_name || 'Proof of payment'), fileUrl: String(row.file_url || ''), storagePath: String(row.storage_path || ''), status: row.status || 'Pending', createdAt: String(row.created_at || new Date().toISOString()),
  booking: row.bookings ? { referenceNumber: String(row.bookings.reference_number || ''), customerName: String(row.bookings.customer_name || ''), totalAmount: Number(row.bookings.total_amount || row.bookings.deposit || 0) } : undefined,
});

export async function uploadPaymentProof(bookingId: string, file: File): Promise<PaymentProof> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
  const path = `${bookingId}/${Date.now()}-${safeName}`;
  const supabase = getClient();
  const { data: upload, error: uploadError } = await supabase.storage.from('payment-proofs').upload(path, file, { upsert: false });
  if (uploadError) throw new Error(`Unable to upload proof: ${uploadError.message}`);
  const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(upload.path);
  const { data, error } = await supabase.from('payment_proofs').insert({ booking_id: bookingId, file_name: file.name, file_url: urlData.publicUrl, storage_path: upload.path, status: 'Pending' }).select().single();
  if (error) throw new Error(`Proof uploaded but could not be recorded: ${error.message}`);
  return map(data);
}

export async function fetchPaymentProofs(): Promise<PaymentProof[]> {
  const { data, error } = await getClient().from('payment_proofs').select('*, bookings(reference_number, customer_name, total_amount, deposit)').order('created_at', { ascending: false });
  if (error) throw new Error(`Unable to load payment proofs: ${error.message}`);
  return Promise.all((data || []).map(async (row) => {
    const proof = map(row);
    if (proof.storagePath) {
      const { data: signed } = await getClient().storage.from('payment-proofs').createSignedUrl(proof.storagePath, 60 * 10);
      if (signed?.signedUrl) proof.fileUrl = signed.signedUrl;
    }
    return proof;
  }));
}

export async function verifyPaymentProof(id: string, bookingId: string, paymentStatus: Extract<PaymentStatus, 'Deposit Paid' | 'Fully Paid'>): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('payment_proofs').update({ status: 'Verified', reviewed_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Unable to verify payment proof: ${error.message}`);
  await updateBooking(bookingId, { paymentStatus });
}

export async function rejectPaymentProof(id: string): Promise<void> {
  const { error } = await getClient().from('payment_proofs').update({ status: 'Rejected', reviewed_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(`Unable to reject payment proof: ${error.message}`);
}
