'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, ArrowLeft, User, Briefcase, CreditCard } from 'lucide-react';
import type { LoanData } from './LoanWizard';

interface Props {
  data: LoanData;
  updateData: (u: Partial<LoanData>) => void;
  onNext: () => void;
  onBack: () => void;
}

interface DetailsForm {
  firstName: string;
  lastName: string;
  idNumber: string;
  employer: string;
  employmentType: string;
  bankName: string;
  accountNumber: string;
}

const EMPLOYMENT_TYPES = ['Permanently Employed', 'Contract Employee', 'Self-Employed', 'Part-Time', 'Pensioner', 'Other'];
const BANKS = ['Absa', 'FNB', 'Nedbank', 'Standard Bank', 'Capitec', 'African Bank', 'TymeBank', 'Discovery Bank', 'Other'];

export default function StepPersonalDetails({ data, updateData, onNext, onBack }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<DetailsForm>({
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      idNumber: data.idNumber,
      employer: data.employer,
      employmentType: data.employmentType,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
    },
  });

  const onSubmit = (values: DetailsForm) => {
    updateData(values);
    onNext();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Your Details</h2>
        <p className="text-sm text-foreground-muted">Personal and employment information for your loan application.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Info */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <User size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Personal Information</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                First Name <span className="text-danger">*</span>
              </label>
              <input
                {...register('firstName', { required: 'First name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                type="text"
                placeholder="Sipho"
                className="input-luxury w-full px-4 py-3 text-sm"
              />
              {errors.firstName && <p className="text-xs text-danger mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                Last Name <span className="text-danger">*</span>
              </label>
              <input
                {...register('lastName', { required: 'Last name is required', minLength: { value: 2, message: 'Minimum 2 characters' } })}
                type="text"
                placeholder="Khumalo"
                className="input-luxury w-full px-4 py-3 text-sm"
              />
              {errors.lastName && <p className="text-xs text-danger mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
              SA ID Number <span className="text-danger">*</span>
            </label>
            <p className="text-xs text-foreground-muted mb-1.5">13-digit South African identity number</p>
            <input
              {...register('idNumber', {
                required: 'ID number is required',
                pattern: { value: /^\d{13}$/, message: 'Must be exactly 13 digits' },
              })}
              type="text"
              placeholder="0001015009087"
              maxLength={13}
              className="input-luxury w-full px-4 py-3 text-sm font-mono tracking-widest"
            />
            {errors.idNumber && <p className="text-xs text-danger mt-1">{errors.idNumber.message}</p>}
          </div>
        </div>

        <div className="section-divider" />

        {/* Employment */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Employment Details</span>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                Employer / Company Name <span className="text-danger">*</span>
              </label>
              <input
                {...register('employer', { required: 'Employer name is required' })}
                type="text"
                placeholder="Motsepe Foundation"
                className="input-luxury w-full px-4 py-3 text-sm"
              />
              {errors.employer && <p className="text-xs text-danger mt-1">{errors.employer.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                Employment Type <span className="text-danger">*</span>
              </label>
              <select
                {...register('employmentType', { required: 'Employment type is required' })}
                className="input-luxury w-full px-4 py-3 text-sm appearance-none"
              >
                <option value="">Select type...</option>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={`emptype-${t}`} value={t}>{t}</option>
                ))}
              </select>
              {errors.employmentType && <p className="text-xs text-danger mt-1">{errors.employmentType.message}</p>}
            </div>
          </div>
        </div>

        <div className="section-divider" />

        {/* Banking */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground tracking-wide uppercase">Banking Details</span>
          </div>
          <p className="text-xs text-foreground-muted mb-4">Required for debit order setup. Your details are encrypted and secure.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                Bank Name <span className="text-danger">*</span>
              </label>
              <select
                {...register('bankName', { required: 'Bank name is required' })}
                className="input-luxury w-full px-4 py-3 text-sm appearance-none"
              >
                <option value="">Select bank...</option>
                {BANKS.map((b) => (
                  <option key={`bank-${b}`} value={b}>{b}</option>
                ))}
              </select>
              {errors.bankName && <p className="text-xs text-danger mt-1">{errors.bankName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
                Account Number <span className="text-danger">*</span>
              </label>
              <input
                {...register('accountNumber', {
                  required: 'Account number is required',
                  pattern: { value: /^\d{8,12}$/, message: 'Enter a valid account number (8–12 digits)' },
                })}
                type="text"
                placeholder="1234567890"
                className="input-luxury w-full px-4 py-3 text-sm font-mono tracking-widest"
              />
              {errors.accountNumber && <p className="text-xs text-danger mt-1">{errors.accountNumber.message}</p>}
            </div>
          </div>
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
            Continue
            <ArrowRight size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}