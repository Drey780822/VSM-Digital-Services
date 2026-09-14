'use client';

import { useForm } from 'react-hook-form';
import { ArrowRight, ArrowLeft, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { EVENT_TYPES } from '@/lib/bookings/constants';
import type { BookingFormData, EventType } from '@/lib/bookings/types';

interface Props {
  data: BookingFormData;
  updateData: (u: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface EventForm {
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  guestCount: number;
}

export default function StepEventInfo({ data, updateData, onNext, onBack }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventForm>({
    defaultValues: {
      eventType: (data.eventType as EventType) || undefined,
      eventDate: data.eventDate,
      eventTime: data.eventTime,
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      guestCount: data.guestCount || 50,
    },
  });

  const onSubmit = (values: EventForm) => {
    updateData(values);
    onNext();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Event Information</h2>
        <p className="text-sm text-foreground-muted">
          Tell us about your event so Vincent can prepare the perfect coverage.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Event Type <span className="text-danger">*</span>
          </label>
          <select
            {...register('eventType', { required: 'Please select an event type' })}
            className="input-luxury w-full px-4 py-3 text-sm"
          >
            <option value="">Select event type</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.eventType && <p className="text-xs text-danger mt-1.5">{errors.eventType.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
              Event Date <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                {...register('eventDate', { required: 'Event date is required' })}
                type="date"
                min={today}
                className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              />
            </div>
            {errors.eventDate && <p className="text-xs text-danger mt-1.5">{errors.eventDate.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
              Event Time <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                {...register('eventTime', { required: 'Event time is required' })}
                type="time"
                className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              />
            </div>
            {errors.eventTime && <p className="text-xs text-danger mt-1.5">{errors.eventTime.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Venue Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              {...register('venueName', { required: 'Venue name is required' })}
              className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              placeholder="Sandton Convention Centre"
            />
          </div>
          {errors.venueName && <p className="text-xs text-danger mt-1.5">{errors.venueName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Venue Address <span className="text-danger">*</span>
          </label>
          <textarea
            {...register('venueAddress', { required: 'Venue address is required' })}
            rows={2}
            className="input-luxury w-full px-4 py-3 text-sm resize-none"
            placeholder="Full street address, city, province"
          />
          {errors.venueAddress && (
            <p className="text-xs text-danger mt-1.5">{errors.venueAddress.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
            Number of Guests <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              {...register('guestCount', {
                required: 'Guest count is required',
                valueAsNumber: true,
                min: { value: 1, message: 'At least 1 guest' },
                max: { value: 5000, message: 'Maximum 5000 guests' },
              })}
              type="number"
              min={1}
              className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
            />
          </div>
          {errors.guestCount && <p className="text-xs text-danger mt-1.5">{errors.guestCount.message}</p>}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="btn-silver flex-1 py-3 text-sm font-medium rounded-md flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <button
            type="submit"
            className="btn-gold flex-1 py-3 text-sm font-semibold rounded-md flex items-center justify-center gap-2"
          >
            Choose Package
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}
