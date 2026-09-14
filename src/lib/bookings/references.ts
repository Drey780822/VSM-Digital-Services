export function generateReferenceNumber(eventDate: string): string {
  const datePart = eventDate.replace(/-/g, '');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `VSM-${datePart}-${suffix}`;
}

export function generateTrackingNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `TRK-${code}`;
}
