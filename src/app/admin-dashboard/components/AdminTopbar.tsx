'use client';
import React, { useState } from 'react';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';

interface Props {
  onMobileMenuOpen: () => void;
}

export default function AdminTopbar({ onMobileMenuOpen }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="h-14 bg-background-secondary border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 text-foreground-muted hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className={`flex items-center gap-2 bg-muted rounded-lg px-3 py-2 transition-all duration-200 ${searchOpen ? 'w-64' : 'w-48'}`}>
          <Search size={14} className="text-foreground-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search bookings, clients..."
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            className="bg-transparent text-sm text-foreground placeholder:text-foreground-muted outline-none w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-foreground-muted hover:text-foreground transition-colors rounded-lg hover:bg-muted" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-border cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-background">
            VV
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-foreground leading-none">Vince Vscobar</div>
            <div className="text-xs text-foreground-muted mt-0.5">Administrator</div>
          </div>
          <ChevronDown size={14} className="text-foreground-muted hidden sm:block" />
        </div>
      </div>
    </header>
  );
}