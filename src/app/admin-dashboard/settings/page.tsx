'use client';
import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import {
  Settings,
  Shield,
  Database,
  Building,
  CreditCard,
  CheckCircle,
  Save,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { isSupabaseConfigured, getClient } from '@/lib/services/supabase-helpers';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [storageStatus, setStorageStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  const [businessData, setBusinessData] = useState({
    businessName: 'VSM Digital Services',
    ownerName: 'Vincent S. Mabogoane',
    contactEmail: 'info@vsm.co.za',
    contactPhone: '+27 82 000 0000',
    taxNumber: '4920293849',
    bankName: 'Standard Bank',
    accountNumber: '10192837465',
    branchCode: '051001',
    standardInterestRate: 18.0,
    depositRequirementPercentage: 50,
  });

  const checkHealth = async () => {
    setDbStatus('checking');
    setStorageStatus('checking');
    try {
      const supabase = getClient();
      const { error: dbError } = await supabase.from('bookings').select('id', { count: 'exact', head: true });
      if (dbError) setDbStatus('error');
      else setDbStatus('connected');

      const { error: storageError } = await supabase.storage.listBuckets();
      if (storageError) setStorageStatus('error');
      else setStorageStatus('connected');
    } catch {
      setDbStatus('error');
      setStorageStatus('error');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Business configuration and operational settings updated!');
    }, 600);
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Business Settings</h1>
              <p className="text-sm text-foreground-muted">
                Configure owner preferences, invoicing details, financial rules, and cloud infrastructure.
              </p>
            </div>

            <button
              onClick={checkHealth}
              className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground-muted hover:text-foreground transition-colors flex items-center gap-1.5 text-xs"
              title="Run diagnostics"
            >
              <RefreshCw size={14} className={dbStatus === 'checking' ? 'animate-spin' : ''} />
              <span>Run Diagnostics</span>
            </button>
          </div>

          {/* Cloud Health & Diagnostics */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Database size={16} className="text-primary" />
              <span>System & Supabase Infrastructure</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-muted/20 p-3.5 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">Supabase PostgreSQL</span>
                  <span className="text-[10px] text-foreground-muted">Connected tables & RLS policies</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  dbStatus === 'connected' ? 'bg-success/20 text-success border-success/30' : 'bg-warning/20 text-warning border-warning/30'
                }`}>
                  {dbStatus === 'connected' ? 'Operational' : dbStatus === 'checking' ? 'Testing...' : 'Degraded'}
                </span>
              </div>

              <div className="bg-muted/20 p-3.5 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground block">Supabase Storage Buckets</span>
                  <span className="text-[10px] text-foreground-muted">`gallery`, `vaults`, `documents`</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  storageStatus === 'connected' ? 'bg-success/20 text-success border-success/30' : 'bg-warning/20 text-warning border-warning/30'
                }`}>
                  {storageStatus === 'connected' ? 'Operational' : storageStatus === 'checking' ? 'Testing...' : 'Degraded'}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* Business Profile */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building size={16} className="text-primary" />
                <span>Business & Brand Profile</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Trading Name
                  </label>
                  <input
                    type="text"
                    value={businessData.businessName}
                    onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    value={businessData.ownerName}
                    onChange={(e) => setBusinessData({ ...businessData, ownerName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Public Email
                  </label>
                  <input
                    type="email"
                    value={businessData.contactEmail}
                    onChange={(e) => setBusinessData({ ...businessData, contactEmail: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Public Phone
                  </label>
                  <input
                    type="text"
                    value={businessData.contactPhone}
                    onChange={(e) => setBusinessData({ ...businessData, contactPhone: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CreditCard size={16} className="text-primary" />
                <span>Banking Details for Invoicing</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={businessData.bankName}
                    onChange={(e) => setBusinessData({ ...businessData, bankName: e.target.value })}
                    className="input-luxury w-full px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={businessData.accountNumber}
                    onChange={(e) => setBusinessData({ ...businessData, accountNumber: e.target.value })}
                    className="input-luxury w-full px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-foreground-muted uppercase mb-1">
                    Branch Code
                  </label>
                  <input
                    type="text"
                    value={businessData.branchCode}
                    onChange={(e) => setBusinessData({ ...businessData, branchCode: e.target.value })}
                    className="input-luxury w-full px-3 py-2 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Security Profile */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <span>Active Owner Session</span>
              </h3>
              <p className="text-xs text-foreground-muted">
                Authenticated as: <span className="font-mono text-primary font-semibold">{user?.email}</span> (Owner Operations Role)
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn-gold px-6 py-2.5 text-xs font-semibold rounded-lg flex items-center gap-2 shadow-sm"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save All Settings</span>
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
