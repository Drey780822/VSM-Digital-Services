import { getClient } from './supabase-helpers';
import { uploadFileToBucket, deleteFileFromBucket } from './storage.service';

export interface GalleryItemRecord {
  id: string;
  title: string;
  category: 'Wedding' | 'Birthday' | 'Corporate' | 'Graduation' | 'Funeral' | 'Groove' | string;
  location: string;
  imageUrl: string;
  src: string; // compatibility alias for landing page AppImage
  storagePath?: string;
  altText?: string;
  alt: string; // compatibility alias for landing page
  spanClass?: string;
  span: string; // compatibility alias for landing page
  displayOrder: number;
  sortOrder: number; // alias
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGalleryItemInput {
  title: string;
  category: string;
  location?: string;
  imageUrl?: string;
  storagePath?: string;
  altText?: string;
  spanClass?: string;
  displayOrder?: number;
  sortOrder?: number;
  aspectRatio?: 'portrait' | 'landscape' | 'square';
  isActive?: boolean;
}

// Fallback seed items for landing page if Supabase table is empty
export const DEFAULT_GALLERY_ITEMS: GalleryItemRecord[] = [
  {
    id: 'gal-1',
    category: 'Wedding',
    title: 'Nkosi & Zanele Wedding',
    location: 'Sandton, JHB',
    imageUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_133f668c9-1772253538405.png',
    src: 'https://img.rocket.new/generatedImages/rocket_gen_img_133f668c9-1772253538405.png',
    altText: 'Bride and groom sharing a romantic first look at a luxury Johannesburg wedding venue',
    alt: 'Bride and groom sharing a romantic first look at a luxury Johannesburg wedding venue',
    spanClass: 'col-span-2 row-span-2',
    span: 'col-span-2 row-span-2',
    displayOrder: 1,
    sortOrder: 1,
    aspectRatio: 'landscape',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-2',
    category: 'Birthday',
    title: 'Thandi 30th Celebration',
    location: 'Soweto, JHB',
    imageUrl: 'https://images.unsplash.com/photo-1638297166240-866903a7190c',
    src: 'https://images.unsplash.com/photo-1638297166240-866903a7190c',
    altText: 'Elegant 30th birthday party setup with gold balloons and luxury table decor',
    alt: 'Elegant 30th birthday party setup with gold balloons and luxury table decor',
    spanClass: '',
    span: '',
    displayOrder: 2,
    sortOrder: 2,
    aspectRatio: 'square',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-3',
    category: 'Corporate',
    title: 'Motsepe Foundation Gala',
    location: 'Pretoria',
    imageUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_13291d46a-1773739289908.png',
    src: 'https://img.rocket.new/generatedImages/rocket_gen_img_13291d46a-1773739289908.png',
    altText: 'Corporate gala event with stage lighting and formal attendees in evening wear',
    alt: 'Corporate gala event with stage lighting and formal attendees in evening wear',
    spanClass: '',
    span: '',
    displayOrder: 3,
    sortOrder: 3,
    aspectRatio: 'landscape',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-4',
    category: 'Graduation',
    title: 'Wits Class of 2025',
    location: 'Braamfontein',
    imageUrl: 'https://images.unsplash.com/photo-1652687879409-b7d65dec60f6',
    src: 'https://images.unsplash.com/photo-1652687879409-b7d65dec60f6',
    altText: 'University graduation ceremony with graduates in academic gowns tossing caps',
    alt: 'University graduation ceremony with graduates in academic gowns tossing caps',
    spanClass: '',
    span: '',
    displayOrder: 4,
    sortOrder: 4,
    aspectRatio: 'portrait',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-5',
    category: 'Funeral',
    title: 'Celebrating a Legacy',
    location: 'Durban',
    imageUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_12128be88-1764780775213.png',
    src: 'https://img.rocket.new/generatedImages/rocket_gen_img_12128be88-1764780775213.png',
    altText: 'Respectful memorial service with flowers and candlelight in a dignified setting',
    alt: 'Respectful memorial service with flowers and candlelight in a dignified setting',
    spanClass: '',
    span: '',
    displayOrder: 5,
    sortOrder: 5,
    aspectRatio: 'landscape',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gal-6',
    category: 'Groove',
    title: 'Afrobeats Night Out',
    location: 'Cape Town',
    imageUrl: 'https://img.rocket.new/generatedImages/rocket_gen_img_15b6d345b-1773261133523.png',
    src: 'https://img.rocket.new/generatedImages/rocket_gen_img_15b6d345b-1773261133523.png',
    altText: 'Vibrant nightclub event with colorful stage lights and dancing crowd',
    alt: 'Vibrant nightclub event with colorful stage lights and dancing crowd',
    spanClass: 'col-span-2',
    span: 'col-span-2',
    displayOrder: 6,
    sortOrder: 6,
    aspectRatio: 'landscape',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapGalleryItem(row: Record<string, any>): GalleryItemRecord {
  const url = row.image_url || row.src || '';
  const alt = row.alt_text || row.alt || row.title || 'VSM Photography Showcase';
  const span = row.span_class || row.span || '';
  const order = Number(row.display_order ?? row.sort_order ?? 0);

  return {
    id: row.id,
    title: row.title || '',
    category: row.category || 'Wedding',
    location: row.location || 'South Africa',
    imageUrl: url,
    src: url,
    storagePath: row.storage_path ?? undefined,
    altText: alt,
    alt,
    spanClass: span,
    span,
    displayOrder: order,
    sortOrder: order,
    aspectRatio: row.aspect_ratio || 'landscape',
    isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

export async function fetchGalleryItems(includeInactive = false): Promise<GalleryItemRecord[]> {
  const supabase = getClient();
  let query = supabase.from('gallery_items').select('*').order('display_order', { ascending: true });

  if (!includeInactive) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.warn(`Could not load gallery_items from Supabase: ${error.message}. Using default set.`);
    return DEFAULT_GALLERY_ITEMS;
  }

  if (!data || data.length === 0) {
    return DEFAULT_GALLERY_ITEMS;
  }

  return data.map(mapGalleryItem);
}

export async function uploadGalleryImage(file: File): Promise<{ publicUrl: string; storagePath: string }> {
  const timestamp = Date.now();
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `gallery/${timestamp}-${cleanName}`;
  const uploadRes = await uploadFileToBucket('gallery', path, file);
  return {
    publicUrl: uploadRes.url,
    storagePath: uploadRes.path,
  };
}

export async function createGalleryItem(
  input: CreateGalleryItemInput,
  imageFile?: File
): Promise<GalleryItemRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  let imageUrl = input.imageUrl || '';
  let storagePath = input.storagePath;

  if (imageFile) {
    const res = await uploadGalleryImage(imageFile);
    imageUrl = res.publicUrl;
    storagePath = res.storagePath;
  }

  if (!imageUrl) {
    throw new Error('An image file or image URL is required.');
  }

  const order = input.displayOrder ?? input.sortOrder ?? 0;

  const insertRow = {
    title: input.title,
    category: input.category,
    location: input.location || 'South Africa',
    image_url: imageUrl,
    storage_path: storagePath ?? null,
    alt_text: input.altText ?? input.title,
    span_class: input.spanClass ?? '',
    display_order: order,
    is_active: input.isActive ?? true,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('gallery_items').insert(insertRow).select().single();
  if (error) throw new Error(`Failed to create gallery item: ${error.message}`);
  return mapGalleryItem(data);
}

export async function updateGalleryItem(
  id: string,
  updates: Partial<CreateGalleryItemInput>,
  newImageFile?: File
): Promise<GalleryItemRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const updateRow: Record<string, unknown> = {
    updated_at: now,
  };

  if (newImageFile) {
    const res = await uploadGalleryImage(newImageFile);
    updateRow.image_url = res.publicUrl;
    updateRow.storage_path = res.storagePath;
  } else if (updates.imageUrl !== undefined) {
    updateRow.image_url = updates.imageUrl;
  }

  if (updates.title !== undefined) updateRow.title = updates.title;
  if (updates.category !== undefined) updateRow.category = updates.category;
  if (updates.location !== undefined) updateRow.location = updates.location;
  if (updates.altText !== undefined) updateRow.alt_text = updates.altText;
  if (updates.spanClass !== undefined) updateRow.span_class = updates.spanClass;
  if (updates.displayOrder !== undefined || updates.sortOrder !== undefined) {
    updateRow.display_order = updates.displayOrder ?? updates.sortOrder;
  }
  if (updates.isActive !== undefined) updateRow.is_active = updates.isActive;

  const { data, error } = await supabase
    .from('gallery_items')
    .update(updateRow)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Failed to update gallery item: ${error.message}`);
  return mapGalleryItem(data);
}

export async function deleteGalleryItem(id: string, storagePath?: string): Promise<void> {
  const supabase = getClient();
  if (storagePath) {
    await deleteFileFromBucket('gallery', storagePath);
  }
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete gallery item: ${error.message}`);
}
