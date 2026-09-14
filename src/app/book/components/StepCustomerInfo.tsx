'use client';

import { useForm } from 'react-hook-form';
import { ArrowRight, User, Mail, Phone, CreditCard } from 'lucide-react';
import type { BookingFormData } from '@/lib/bookings/types';

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerForm>({
    defaultValues: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      idNumber: data.idNumber,
    },
  });

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
          Tell us who to contact about your event. No account required.
        </p>
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
