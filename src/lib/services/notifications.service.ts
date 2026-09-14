import { getClient } from './supabase-helpers';

export type NotificationType =
  | 'booking'
  | 'loan'
  | 'repayment'
  | 'default'
  | 'vault'
  | 'invoice'
  | 'system';

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateNotificationInput {
  title: string;
  message: string;
  type?: NotificationType;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapNotification(row: Record<string, any>): NotificationRecord {
  return {
    id: row.id,
    title: row.title || 'System Notification',
    message: row.message || '',
    type: (row.type || 'system') as NotificationType,
    referenceId: row.reference_id ?? undefined,
    referenceType: row.reference_type ?? undefined,
    isRead: Boolean(row.is_read),
    metadata: row.metadata ?? undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export async function fetchNotifications(
  filter: 'all' | 'unread' = 'all'
): Promise<NotificationRecord[]> {
  const supabase = getClient();
  let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });

  if (filter === 'unread') {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
  return (data ?? []).map(mapNotification);
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = getClient();
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw new Error(`Failed to mark notification as read: ${error.message}`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('is_read', false);
  if (error) throw new Error(`Failed to mark all notifications as read: ${error.message}`);
}

export async function deleteNotification(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw new Error(`Failed to delete notification: ${error.message}`);
}

export async function createNotification(
  input: CreateNotificationInput
): Promise<NotificationRecord> {
  const supabase = getClient();
  const now = new Date().toISOString();

  const insertRow = {
    title: input.title,
    message: input.message,
    type: input.type || 'system',
    reference_id: input.referenceId ?? null,
    reference_type: input.referenceType ?? null,
    is_read: false,
    metadata: input.metadata ?? null,
    created_at: now,
  };

  const { data, error } = await supabase.from('notifications').insert(insertRow).select().single();
  if (error) throw new Error(`Failed to create notification: ${error.message}`);
  return mapNotification(data);
}
