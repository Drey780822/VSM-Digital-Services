'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard, Calendar, Camera, TrendingUp, Users, Image,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, BarChart2,
  CreditCard, AlertTriangle, FileText,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    id: 'group-main',
    label: 'Operations',
    items: [
      { id: 'nav-dashboard', icon: LayoutDashboard, label: 'Dashboard', href: '/admin-dashboard', badge: null },
      { id: 'nav-bookings', icon: Camera, label: 'Bookings', href: '/admin-dashboard', badge: '3' },
      { id: 'nav-calendar', icon: Calendar, label: 'Calendar', href: '/admin-dashboard', badge: null },
      { id: 'nav-gallery', icon: Image, label: 'Memory Vaults', href: '/admin-dashboard', badge: '2' },
    ],
  },
  {
    id: 'group-finance',
    label: 'Finance',
    items: [
      { id: 'nav-loans', icon: TrendingUp, label: 'Loans', href: '/admin-dashboard', badge: '5' },
      { id: 'nav-repayments', icon: CreditCard, label: 'Repayments', href: '/admin-dashboard', badge: null },
      { id: 'nav-defaults', icon: AlertTriangle, label: 'Defaults', href: '/admin-dashboard', badge: '2' },
      { id: 'nav-reports', icon: BarChart2, label: 'Analytics', href: '/admin-dashboard', badge: null },
    ],
  },
  {
    id: 'group-clients',
    label: 'Clients',
    items: [
      { id: 'nav-clients', icon: Users, label: 'Clients', href: '/admin-dashboard', badge: null },
      { id: 'nav-comms', icon: Bell, label: 'Notifications', href: '/admin-dashboard', badge: '7' },
      { id: 'nav-invoices', icon: FileText, label: 'Invoices', href: '/admin-dashboard', badge: null },
    ],
  },
];

interface Props {
  collapsed: boolean;
  onCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({ collapsed, onCollapse, mobileOpen, onMobileClose }: Props) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className={`flex flex-col h-full bg-background-secondary border-r border-border transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
      {/* Logo */}
      <div className={`flex items-center border-b border-border flex-shrink-0 ${collapsed ? 'justify-center p-4' : 'gap-3 p-5'}`}>
        <AppLogo size={32} />
        {!collapsed && (
          <span className="font-display text-base font-semibold text-gradient-gold tracking-wide"></span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="mb-5">
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold tracking-widest uppercase text-foreground-muted mb-2 block">
                {group.label}
              </span>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href && item.id === 'nav-dashboard';
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-gold' :'text-foreground-muted hover:text-foreground hover:bg-muted'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <item.icon size={17} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-2">
        <Link
          href="/admin-dashboard"
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-muted transition-all duration-200 mb-1 ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={17} />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
        <Link
          href="/"
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-danger/70 hover:text-danger hover:bg-danger/10 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={17} />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={onCollapse}
          className={`mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-foreground-muted hover:text-primary hover:bg-muted transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span className="text-xs">Collapse</span></>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        {sidebarContent}
      </div>

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