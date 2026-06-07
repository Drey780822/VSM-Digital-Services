'use client';
import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, Edit2, MoreHorizontal, Upload } from 'lucide-react';

const BOOKINGS = [
  { id: 'bk-001', client: 'Nkosi Dlamini', eventType: 'Wedding', package: 'Legacy Collection', date: '14 Jun 2026', location: 'Sandton Convention Centre', deposit: 'R 7,250', status: 'Deposit Paid', financed: true },
  { id: 'bk-002', client: 'Zanele Mokoena', eventType: 'Birthday', package: 'Cinematic Experience', date: '21 Jun 2026', location: 'Soweto, JHB', deposit: 'R 4,450', status: 'Approved', financed: false },
  { id: 'bk-003', client: 'Sipho Khumalo', eventType: 'Corporate', package: 'Cinematic Experience', date: '28 Jun 2026', location: 'Sandton City', deposit: 'R 4,450', status: 'Scheduled', financed: false },
  { id: 'bk-004', client: 'Thandi Ndlovu', eventType: 'Graduation', package: 'Essential Memories', date: '05 Jul 2026', location: 'Wits University', deposit: 'R 2,250', status: 'Pending', financed: false },
  { id: 'bk-005', client: 'Bongani Sithole', eventType: 'Funeral', package: 'Essential Memories', date: '07 Jun 2026', location: 'Durban North', deposit: 'R 2,250', status: 'Completed', financed: false },
  { id: 'bk-006', client: 'Lerato Phiri', eventType: 'Wedding', package: 'Legacy Collection', date: '12 Jul 2026', location: 'Cape Town', deposit: 'R 7,250', status: 'Pending', financed: true },
  { id: 'bk-007', client: 'Mpho Dube', eventType: 'Groove', package: 'Cinematic Experience', date: '19 Jul 2026', location: 'Pretoria East', deposit: 'R 4,450', status: 'Approved', financed: false },
  { id: 'bk-008', client: 'Ayanda Mthembu', eventType: 'Birthday', package: 'Legacy Collection', date: '26 Jul 2026', location: 'Rosebank, JHB', deposit: 'R 7,250', status: 'Media Uploaded', financed: true },
  { id: 'bk-009', client: 'Kabelo Nkosi', eventType: 'Corporate', package: 'Essential Memories', date: '02 Aug 2026', location: 'Midrand', deposit: 'R 2,250', status: 'Scheduled', financed: false },
  { id: 'bk-010', client: 'Nomsa Vilakazi', eventType: 'Wedding', package: 'Cinematic Experience', date: '09 Aug 2026', location: 'Bloemfontein', deposit: 'R 4,450', status: 'Rejected', financed: false },
];

const STATUS_STYLES: Record<string, string> = {
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  'Deposit Paid': 'status-scheduled',
  Scheduled: 'status-scheduled',
  Completed: 'status-completed',
  'Media Uploaded': 'status-completed',
};

const EVENT_TYPE_COLORS: Record<string, string> = {
  Wedding: 'text-primary',
  Birthday: 'text-info',
  Corporate: 'text-secondary',
  Graduation: 'text-success',
  Funeral: 'text-foreground-muted',
  Groove: 'text-warning',
};

type SortKey = 'client' | 'eventType' | 'date' | 'status';

export default function BookingsTable() {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 6;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = BOOKINGS.filter((b) =>
    b.client.toLowerCase().includes(search.toLowerCase()) ||
    b.eventType.toLowerCase().includes(search.toLowerCase()) ||
    b.status.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey]; const bv = b[sortKey];
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="flex flex-col ml-1">
      <ChevronUp size={9} className={sortKey === col && sortDir === 'asc' ? 'text-primary' : 'text-foreground-muted opacity-40'} />
      <ChevronDown size={9} className={sortKey === col && sortDir === 'desc' ? 'text-primary' : 'text-foreground-muted opacity-40'} />
    </span>
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Bookings</h3>
          <p className="text-xs text-foreground-muted mt-0.5">{filtered.length} total · {BOOKINGS.filter(b => b.status === 'Pending').length} pending review</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-luxury px-3 py-2 text-xs w-40 lg:w-52"
          />
          <button className="btn-gold px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5">
            <Upload size={12} />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('client')}>
                  Client <SortIcon col="client" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('eventType')}>
                  Event Type <SortIcon col="eventType" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">Package</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('date')}>
                  Event Date <SortIcon col="date" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">Location</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">Deposit</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">Financed</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">
                <button className="flex items-center hover:text-foreground transition-colors" onClick={() => handleSort('status')}>
                  Status <SortIcon col="status" />
                </button>
              </th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold text-foreground-muted tracking-widest uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((b) => (
              <tr key={b.id} className="border-b border-border/50 table-row-hover transition-colors duration-150 group">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-[10px] font-bold text-background flex-shrink-0">
                      {b.client.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{b.client}</div>
                      <div className="text-[10px] text-foreground-muted">{b.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`font-medium ${EVENT_TYPE_COLORS[b.eventType] || 'text-foreground'}`}>{b.eventType}</span>
                </td>
                <td className="px-4 py-3.5 text-foreground-muted max-w-[140px] truncate">{b.package}</td>
                <td className="px-4 py-3.5 text-foreground counter-value">{b.date}</td>
                <td className="px-4 py-3.5 text-foreground-muted max-w-[140px] truncate">{b.location}</td>
                <td className="px-4 py-3.5 font-semibold text-foreground counter-value">{b.deposit}</td>
                <td className="px-4 py-3.5">
                  {b.financed ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-gold">Financed</span>
                  ) : (
                    <span className="text-foreground-muted text-[10px]">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${STATUS_STYLES[b.status] || 'status-pending'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button className="w-7 h-7 rounded-md bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-150 text-foreground-muted" title="View booking details">
                      <Eye size={13} />
                    </button>
                    <button className="w-7 h-7 rounded-md bg-muted hover:bg-info/10 hover:text-info flex items-center justify-center transition-all duration-150 text-foreground-muted" title="Edit booking">
                      <Edit2 size={13} />
                    </button>
                    <button className="w-7 h-7 rounded-md bg-muted hover:bg-muted flex items-center justify-center transition-all duration-150 text-foreground-muted" title="More actions">
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-border">
        <span className="text-xs text-foreground-muted">
          Showing {Math.min((page - 1) * perPage + 1, sorted.length)}–{Math.min(page * perPage, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1.5 rounded-md text-xs text-foreground-muted bg-muted hover:bg-background-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={`page-${i + 1}`}
              onClick={() => setPage(i + 1)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                page === i + 1 ? 'bg-gold-gradient text-background' : 'text-foreground-muted bg-muted hover:bg-background-elevated'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1.5 rounded-md text-xs text-foreground-muted bg-muted hover:bg-background-elevated disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}