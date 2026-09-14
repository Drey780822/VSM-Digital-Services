'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  Calendar,
  Camera,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  CreditCard,
  AlertTriangle,
  FileText,
  Sparkles,
} from 'lucide-react';
import { fetchDashboardKPISummary } from '@/lib/services/analytics.service';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [badgeCounts, setBadgeCounts] = useState<{
    bookings?: number;
    loans?: number;
    defaults?: number;
    notifications?: number;
    vaults?: number;
  }>({});

  useEffect(() => {
    fetchDashboardKPISummary()
      .then((kpi) => {
        setBadgeCounts({
          bookings: kpi.activeBookings > 0 ? kpi.activeBookings : undefined,
          loans: kpi.pendingLoans > 0 ? kpi.pendingLoans : undefined,
          defaults: kpi.overdueLoansCount > 0 ? kpi.overdueLoansCount : undefined,
          notifications: kpi.unreadNotificationsCount > 0 ? kpi.unreadNotificationsCount : undefined,
          vaults: kpi.galleryQueueCount > 0 ? kpi.galleryQueueCount : undefined,
        });
      })
      .catch(() => {});
  }, [pathname]);

  const navGroups = [
    {
      id: 'group-ops',
      label: 'Operations',
      items: [
        { id: 'nav-dashboard', icon: LayoutDashboard, label: 'Overview', href: '/admin-dashboard', badge: null },
        { id: 'nav-bookings', icon: Camera, label: 'Bookings', href: '/admin-dashboard/bookings', badge: badgeCounts.bookings },
        { id: 'nav-calendar', icon: Calendar, label: 'Calendar', href: '/admin-dashboard/calendar', badge: null },
        { id: 'nav-vaults', icon: Sparkles, label: 'Memory Vaults', href: '/admin-dashboard/vaults', badge: badgeCounts.vaults },
      ],
    },
    {
      id: 'group-finance',
      label: 'Finance & Loans',
      items: [
        { id: 'nav-loans', icon: TrendingUp, label: 'Loans', href: '/admin-dashboard/loans', badge: badgeCounts.loans },
        { id: 'nav-repayments', icon: CreditCard, label: 'Repayments', href: '/admin-dashboard/repayments', badge: null },
        { id: 'nav-defaults', icon: AlertTriangle, label: 'Defaults', href: '/admin-dashboard/defaults', badge: badgeCounts.defaults, badgeVariant: 'danger' },
        { id: 'nav-analytics', icon: BarChart2, label: 'Analytics', href: '/admin-dashboard/analytics', badge: null },
      ],
    },
    {
      id: 'group-crm',
      label: 'Client Management',
      items: [
        { id: 'nav-clients', icon: Users, label: 'Clients CRM', href: '/admin-dashboard/clients', badge: null },
        { id: 'nav-notifications', icon: Bell, label: 'Notifications', href: '/admin-dashboard/notifications', badge: badgeCounts.notifications, badgeVariant: 'gold' },
        { id: 'nav-invoices', icon: FileText, label: 'Invoices', href: '/admin-dashboard/invoices', badge: null },
      ],
    },
    {
      id: 'group-cms',
      label: 'Content & Settings',
      items: [
        { id: 'nav-gallery', icon: ImageIcon, label: 'Gallery CMS', href: '/admin-dashboard/gallery', badge: null },
        { id: 'nav-settings', icon: Settings, label: 'Settings', href: '/admin-dashboard/settings', badge: null },
      ],
    },
  ];

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-background-secondary border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center border-b border-border flex-shrink-0 ${collapsed ? 'justify-center p-3.5' : 'gap-3 px-5 py-4'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <div className="min-w-0">
            <span className="font-display text-base font-semibold text-gradient-gold tracking-wide block leading-tight">
              VSM Ops
            </span>
            <span className="text-[10px] text-foreground-muted uppercase tracking-wider block">
              Control Centre
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.id}>
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold tracking-widest uppercase text-foreground-muted mb-1.5 block">
                {group.label}
              </span>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === '/admin-dashboard'
                    ? pathname === '/admin-dashboard'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-primary/15 text-primary border border-gold font-medium'
                        : 'text-foreground-muted hover:text-foreground hover:bg-muted/60'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon size={16} className={`flex-shrink-0 ${isActive ? 'text-primary' : 'text-foreground-muted group-hover:text-primary'}`} />
                    {!collapsed && (
                      <span className="text-xs font-medium flex-1 truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge !== undefined && item.badge !== null && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center ${
                          item.badgeVariant === 'danger'
                            ? 'bg-danger/20 text-danger border border-danger/30'
                            : 'bg-primary/20 text-primary border border-gold'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge !== undefined && item.badge !== null && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2 space-y-1">
        <button
          onClick={() => signOut()}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-danger/80 hover:text-danger hover:bg-danger/10 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!collapsed && <span className="text-xs font-medium">Sign Out</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onCollapse}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-foreground-muted hover:text-primary hover:bg-muted transition-colors ${collapsed ? 'justify-center' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span className="text-[11px]">Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onMobileClose}
        />
        <div className={`absolute left-0 top-0 bottom-0 transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="w-60 h-full">
            {sidebarContent}
          </div>
        </div>
      </div>
    </>
  );
}