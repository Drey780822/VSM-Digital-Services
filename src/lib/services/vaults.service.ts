import { getClient, generateAccessCode } from './supabase-helpers';
import { uploadFileToBucket, deleteFileFromBucket } from './storage.service';

export type VaultStatus = 'Processing' | 'Ready' | 'Delivered' | 'Archived';

export interface VaultFileRecord {
  id: string;
  vaultId: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileType?: string;
  fileSize?: number;
  isFeatured: boolean;
  createdAt: string;
}

export interface MemoryVaultRecord {
  id: string;
  bookingId?: string;
  customerId?: string;
  clientName: string;
  clientEmail: string;
  title: string;
  eventType: string;
  eventDate: string;
  coverImageUrl?: string;
  accessCode: string;
  status: VaultStatus;
  deliveryNotes?: string;
  deliveredAt?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt?: string;
  files?: VaultFileRecord[];
  filesCount?: number;
}

export interface CreateVaultInput {
  bookingId?: string;
  customerId?: string;
  clientName: string;
  clientEmail: string;
  title: string;
  eventType: string;
  eventDate: string;
  coverImageUrl?: string;
  accessCode?: string;
  status?: VaultStatus;
  deliveryNotes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapVault(row: Record<string, any>): MemoryVaultRecord {
  return {
    id: row.id,
    bookingId: row.booking_id ?? undefined,
    customerId: row.customer_id ?? undefined,
    clientName: row.client_name || '',
    clientEmail: row.client_email || '',
    title: row.title || 'Event Gallery',
    eventType: row.event_type || 'Wedding',
    eventDate: row.event_date || new Date().toISOString().slice(0, 10),
    coverImageUrl: row.cover_image_url ?? undefined,
    accessCode: row.access_code || '',
    status: (row.status || 'Processing') as VaultStatus,
    deliveryNotes: row.delivery_notes ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    viewCount: Number(row.view_count || 0),
    downloadCount: Number(row.download_count || 0),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function fetchMemoryVaults(statusFilter?: string): Promise<MemoryVaultRecord[]> {
  const supabase = getClient();
  let query = supabase.from('memory_vaults').select('*').order('created_at', { ascending: false });

  if (statusFilter && statusFilter !== 'All') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch memory vaults: ${error.message}`);
  return (data ?? []).map(mapVault);
}

export async function getVaultById(id: string): Promise<MemoryVaultRecord | null> {
  const supabase = getClient();
  const { data, error } = await supabase.from('memory_vaults').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`Failed to fetch memory vault: ${error.message}`);
  if (!data) return null;

  const vault = mapVault(data);
  const { data: files } = await supabase
    .from('vault_files')
    .select('*')
    .eq('vault_id', id)
    .order('created_at', { ascending: true });

  vault.files = (files ?? []).map((f) => ({
    id: f.id,
    vaultId: f.vault_id,
    fileName: f.file_name,
    fileUrl: f.file_url,
    storagePath: f.storage_path,
    fileType: f.file_type,
    fileSize: f.file_size,
    isFeatured: Boolean(f.is_featured),
    createdAt: f.created_at,
  }));
  vault.filesCount = vault.files.length;

  return vault;
}

export async function getVaultByAccessCode(accessCode: string): Promise<MemoryVaultRecord | null> {
  const supabase = getClient();
  const cleanCode = accessCode.trim().toUpperCase();

  const { data, error } = await supabase
    .from('memory_vaults')
    .select('*')
    .eq('access_code', cleanCode)
    .maybeSingle();

  if (error) throw new Error(`Failed to lookup vault: ${error.message}`);
  if (!data) return null;

  return getVaultById(data.id);
}

export async function createMemoryVault(input: CreateVaultInput): Promise<MemoryVaultRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();
  const accessCode = input.accessCode ? input.accessCode.toUpperCase() : generateAccessCode(8);

  const insertRow = {
    booking_id: input.bookingId ?? null,
    customer_id: input.customerId ?? null,
    client_name: input.clientName,
    client_email: input.clientEmail.toLowerCase().trim(),
    title: input.title,
    event_type: input.eventType,
    event_date: input.eventDate,
    cover_image_url: input.coverImageUrl ?? null,
    access_code: accessCode,
    status: input.status || 'Processing',
    delivery_notes: input.deliveryNotes ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('memory_vaults').insert(insertRow).select().single();
  if (error) throw new Error(`Failed to create memory vault: ${error.message}`);

  return mapVault(data);
}

export async function updateMemoryVault(
  id: string,
  updates: Partial<CreateVaultInput>
): Promise<MemoryVaultRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const updateRow: Record<string, unknown> = {
    updated_at: now,
  };
  if (updates.clientName !== undefined) updateRow.client_name = updates.clientName;
  if (updates.clientEmail !== undefined) updateRow.client_email = updates.clientEmail.toLowerCase().trim();
  if (updates.title !== undefined) updateRow.title = updates.title;
  if (updates.eventType !== undefined) updateRow.event_type = updates.eventType;
  if (updates.eventDate !== undefined) updateRow.event_date = updates.eventDate;
  if (updates.coverImageUrl !== undefined) updateRow.cover_image_url = updates.coverImageUrl;
  if (updates.status !== undefined) updateRow.status = updates.status;
  if (updates.deliveryNotes !== undefined) updateRow.delivery_notes = updates.deliveryNotes;

  if (updates.status === 'Delivered') {
    updateRow.delivered_at = now;
  }

  const { data, error } = await supabase
    .from('memory_vaults')
    .update(updateRow)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update memory vault: ${error.message}`);
  return mapVault(data);
}

export async function uploadVaultPhotos(
  vaultId: string,
  files: File[]
): Promise<VaultFileRecord[]> {
  const supabase = getClient();
  const uploadedRecords: VaultFileRecord[] = [];

  for (const file of files) {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `vaults/${vaultId}/${timestamp}-${sanitizedName}`;

    const { url, path } = await uploadFileToBucket('vaults', storagePath, file);

    const { data: dbFile, error } = await supabase
      .from('vault_files')
      .insert({
        vault_id: vaultId,
        file_name: file.name,
        file_url: url,
        storage_path: path,
        file_type: file.type,
        file_size: file.size,
        is_featured: false,
      })
      .select()
      .single();

    if (!error && dbFile) {
      uploadedRecords.push({
        id: dbFile.id,
        vaultId: dbFile.vault_id,
        fileName: dbFile.file_name,
        fileUrl: dbFile.file_url,
        storagePath: dbFile.storage_path,
        fileType: dbFile.file_type,
        fileSize: dbFile.file_size,
        isFeatured: dbFile.is_featured,
        createdAt: dbFile.created_at,
      });
    }
  }

  // Set first uploaded file as cover if no cover exists
  if (uploadedRecords.length > 0) {
    const vault = await getVaultById(vaultId);
    if (vault && !vault.coverImageUrl) {
      await supabase
        .from('memory_vaults')
        .update({ cover_image_url: uploadedRecords[0].fileUrl })
        .eq('id', vaultId);
    }
  }

  return uploadedRecords;
}

export async function deleteVaultPhoto(fileId: string, storagePath: string): Promise<void> {
  const supabase = getClient();
  await deleteFileFromBucket('vaults', storagePath);
  const { error } = await supabase.from('vault_files').delete().eq('id', fileId);
  if (error) throw new Error(`Failed to delete vault file: ${error.message}`);
}

export async function incrementVaultStats(
  vaultId: string,
  action: 'view' | 'download'
): Promise<void> {
  const supabase = getClient();
  if (action === 'view') {
    const { data } = await supabase.from('memory_vaults').select('view_count').eq('id', vaultId).single();
    if (data) {
      await supabase
        .from('memory_vaults')
        .update({ view_count: Number(data.view_count || 0) + 1 })
        .eq('id', vaultId);
    }
  } else {
    const { data } = await supabase.from('memory_vaults').select('download_count').eq('id', vaultId).single();
    if (data) {
      await supabase
        .from('memory_vaults')
        .update({ download_count: Number(data.download_count || 0) + 1 })
        .eq('id', vaultId);
    }
  }
}

export async function incrementVaultViews(vaultId: string): Promise<void> {
  return incrementVaultStats(vaultId, 'view');
}

export async function incrementVaultDownloads(vaultId: string): Promise<void> {
  return incrementVaultStats(vaultId, 'download');
}

export async function deleteMemoryVault(id: string): Promise<void> {
  const supabase = getClient();
  // Fetch files to remove from storage
  const { data: files } = await supabase.from('vault_files').select('storage_path').eq('vault_id', id);
  for (const f of files ?? []) {
    if (f.storage_path) await deleteFileFromBucket('vaults', f.storage_path);
  }
  const { error } = await supabase.from('memory_vaults').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete memory vault: ${error.message}`);
}
