import { getClient } from './supabase-helpers';

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

export async function uploadFileToBucket(
  bucket: 'gallery' | 'vaults' | 'documents' | 'invoices',
  filePath: string,
  file: File | Blob
): Promise<UploadResult> {
  const supabase = getClient();
  const cleanPath = filePath.replace(/^\/+/, '');

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(cleanPath, file, {
      upsert: true,
      cacheControl: '3600',
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    path: data.path,
  };
}

export async function deleteFileFromBucket(
  bucket: 'gallery' | 'vaults' | 'documents' | 'invoices',
  filePath: string
): Promise<void> {
  if (!filePath) return;
  const supabase = getClient();
  const cleanPath = filePath.replace(/^\/+/, '');
  const { error } = await supabase.storage.from(bucket).remove([cleanPath]);
  if (error) {
    console.warn(`Storage delete warning: ${error.message}`);
  }
}

export function getStoragePublicUrl(
  bucket: 'gallery' | 'vaults' | 'documents' | 'invoices',
  filePath: string
): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const supabase = getClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath.replace(/^\/+/, ''));
  return data.publicUrl;
}
