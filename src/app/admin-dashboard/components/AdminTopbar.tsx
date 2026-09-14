'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, Search, Menu, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadNotificationCount } from '@/lib/services/notifications.service';

interface Props {
  onMobileMenuOpen: () => void;
}

export default function AdminTopbar({ onMobileMenuOpen }: Props) {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getUnreadNotificationCount()
      .then(setUnreadCount)
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/admin-dashboard/bookings?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  return (
    <header className="h-14 bg-background-secondary border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden p-2 text-foreground-muted hover:text-foreground transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="flex items-center gap-2 bg-muted/60 border border-border/60 rounded-lg px-3 py-1.5 w-48 sm:w-64 focus-within:border-gold transition-all">
            <Search size={14} className="text-foreground-muted flex-shrink-0" />
            <input
              type="text"
              placeholder="Search bookings, clients, loans..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-foreground placeholder:text-foreground-muted outline-none w-full"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin-dashboard/notifications"
          className="relative p-2 text-foreground-muted hover:text-primary transition-colors rounded-lg hover:bg-muted"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger animate-pulse" />
          )}
        </Link>

        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-primary transition-colors px-2.5 py-1.5 rounded-lg border border-border hover:border-gold"
          title="View live website"
        >
          <Sparkles size={12} className="text-primary" />
          <span>Live Site</span>
        </Link>

        <div className="flex items-center gap-2.5 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-xs font-bold text-background shadow-sm">
            {user?.email?.charAt(0).toUpperCase() || 'V'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-foreground leading-none">
               {user?.email?.split('@')[0] || 'V'}
            </div>
            <div className="text-[10px] text-primary font-medium mt-0.5">Owner Operations</div>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-1 rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-danger/10 hover:text-danger"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
