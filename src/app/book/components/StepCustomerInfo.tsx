'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, User, Mail, Phone, CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { BookingFormData } from '@/lib/bookings/types';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  data: BookingFormData;
  updateData: (u: Partial<BookingFormData>) => void;
  onNext: () => void;
}

interface CustomerForm {
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
}

export default function StepCustomerInfo({ data, updateData, onNext }: Props) {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CustomerForm>({
    defaultValues: {
      fullName: data.fullName || (user?.user_metadata?.full_name as string) || '',
      email: data.email || user?.email || '',
      phone: data.phone,
      idNumber: data.idNumber,
    },
  });

  useEffect(() => {
    if (user) {
      if (!data.email && user.email) {
        setValue('email', user.email);
        updateData({ email: user.email });
      }
      const metaName = (user.user_metadata?.full_name as string) || '';
      if (!data.fullName && metaName) {
        setValue('fullName', metaName);
        updateData({ fullName: metaName });
      }
    }
  }, [user, data.email, data.fullName, setValue, updateData]);

  const onSubmit = (values: CustomerForm) => {
    updateData(values);
    onNext();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
          Your Contact Details
        </h2>
        <p className="text-sm text-foreground-muted">
          Tell us who to contact about your event.
        </p>

        {user ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3.5 py-2 text-xs text-success">
            <CheckCircle size={14} className="flex-shrink-0" />
            <span>
              Signed in as <strong>{user.email}</strong>. This booking will be linked to your VSM account.
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs text-foreground">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-primary flex-shrink-0" />
              <span>Have a VSM account? Sign in for 1-click booking and portal tracking.</span>
            </div>
            <Link
              href="/auth/login?redirect=/book"
              className="font-semibold text-primary hover:underline flex-shrink-0"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Full Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              {...register('fullName', { required: 'Full name is required', minLength: 2 })}
              className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              placeholder="Sipho Khumalo"
            />
          </div>
          {errors.fullName && <p className="text-xs text-danger mt-1.5">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Email Address <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
              })}
              type="email"
              className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              placeholder="you@email.com"
            />
          </div>
          {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Phone Number <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              {...register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^(\+27|0)[6-8][0-9]{8}$/,
                  message: 'Enter a valid SA mobile number',
                },
              })}
              type="tel"
              className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              placeholder="072 000 0000"
            />
          </div>
          {errors.phone && <p className="text-xs text-danger mt-1.5">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            ID Number <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <CreditCard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              {...register('idNumber', {
                required: 'ID number is required',
                pattern: { value: /^[0-9]{13}$/, message: 'Enter a valid 13-digit SA ID number' },
              })}
              className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              placeholder="0001015009087"
              maxLength={13}
            />
          </div>
          {errors.idNumber && <p className="text-xs text-danger mt-1.5">{errors.idNumber.message}</p>}
        </div>

        <button type="submit" className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 mt-2">
          Continue to Event Details
          <ArrowRight size={15} />
        </button>
      </form>
    </div>
  );
}
