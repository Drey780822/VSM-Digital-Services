'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Search, Mail, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { getBookingByReference } from '@/lib/bookings/service';

interface TrackForm {
  reference: string;
  email: string;
}

export default function TrackLookupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TrackForm>();

  const onSubmit = async (values: TrackForm) => {
    setLoading(true);
    try {
      const booking = await getBookingByReference(values.reference.trim(), values.email.trim());
      if (!booking) {
        toast.error('No booking found. Check your reference number and email.');
        return;
      }

      sessionStorage.setItem(
        'vsm-track-session',
        JSON.stringify({ email: values.email.trim(), reference: values.reference.trim() })
      );

      router.push(
        `/track/${encodeURIComponent(values.reference.trim())}?email=${encodeURIComponent(values.email.trim())}`
      );
    } catch {
      toast.error('Unable to look up booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
          Booking Reference <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <Hash size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
          <input
            {...register('reference', { required: 'Reference number is required' })}
            className="input-luxury w-full pl-10 pr-4 py-3 text-sm font-mono"
            placeholder="VSM-20260714-001"
          />
        </div>
        {errors.reference && (
          <p className="text-xs text-danger mt-1.5">{errors.reference.message}</p>
        )}
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

      <button
        type="submit"
        disabled={loading}
        className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Search size={15} />
        {loading ? 'Looking up...' : 'Track Booking'}
      </button>
    </form>
  );
}
