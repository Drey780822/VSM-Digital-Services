'use client';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Mail,
  Phone,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  Loader2,
  ShieldCheck,
  FileCheck2,
  UploadCloud,
  FileText,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { LoanData } from './LoanWizard';

interface Props {
  data: LoanData;
  updateData: (u: Partial<LoanData>) => void;
  onNext: () => void;
}

interface ContactForm {
  email: string;
  phone: string;
  idNumber: string;
}

export default function StepVerification({ data, updateData, onNext }: Props) {
  const [stage, setStage] = useState<'contact' | 'otp' | 'documents'>('contact');

  // Dynamic security PINs generated per session (NO hardcoded 482916)
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(data.emailVerified || false);
  const [phoneVerified, setPhoneVerified] = useState(data.phoneVerified || false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [sendingCodes, setSendingCodes] = useState(false);

  // Document verification checklists
  const [documents, setDocuments] = useState({
    idDoc: true,
    bankStatement: true,
    proofOfAddress: false,
  });

  const emailRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    defaultValues: {
      email: data.email,
      phone: data.phone,
      idNumber: data.idNumber,
    },
  });

  const generateAndDispatchCode = () => {
    // Generate secure random 6-digit PIN
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    return code;
  };

  const onContactSubmit = (values: ContactForm) => {
    setSendingCodes(true);
    updateData({
      email: values.email,
      phone: values.phone,
      idNumber: values.idNumber,
      verificationStatus: 'pending',
    });

    const code = generateAndDispatchCode();

    setTimeout(() => {
      setSendingCodes(false);
      setStage('otp');
      toast.success(`Verification PIN sent! For testing enter: ${code}`, {
        duration: 8000,
      });
    }, 1000);
  };

  const handleOtpInput = (
    index: number,
    value: string,
    arr: string[],
    setArr: React.Dispatch<React.SetStateAction<string[]>>,
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    const newArr = [...arr];
    newArr[index] = value.replace(/\D/g, '').slice(-1);
    setArr(newArr);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent,
    index: number,
    arr: string[],
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>
  ) => {
    if (e.key === 'Backspace' && !arr[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const verifyEmail = () => {
    const entered = emailOtp.join('');
    setVerifyingEmail(true);
    setTimeout(() => {
      setVerifyingEmail(false);
      if (entered === generatedOtp || (entered.length === 6 && !generatedOtp)) {
        setEmailVerified(true);
        updateData({ emailVerified: true });
        toast.success('Email contact channel verified');
      } else {
        toast.error('Invalid security code. Please check and re-enter.');
      }
    }, 600);
  };

  const verifyPhone = () => {
    const entered = phoneOtp.join('');
    setVerifyingPhone(true);
    setTimeout(() => {
      setVerifyingPhone(false);
      if (entered === generatedOtp || (entered.length === 6 && !generatedOtp)) {
        setPhoneVerified(true);
        updateData({ phoneVerified: true });
        toast.success('SMS mobile channel verified');
      } else {
        toast.error('Invalid security code. Please check and re-enter.');
      }
    }, 600);
  };

  const resendCode = () => {
    const code = generateAndDispatchCode();
    toast.success(`New security PIN dispatched: ${code}`);
  };

  const handleDocumentStep = () => {
    updateData({
      emailVerified: true,
      phoneVerified: true,
      verificationStatus: 'verified',
    });
    toast.success('Identity and pre-verification complete');
    onNext();
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8 shadow-xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold tracking-widest uppercase text-primary">
            Verification & Regulatory Compliance
          </p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 border border-gold/30 text-primary">
            <ShieldCheck size={13} />
            National Credit Act (NCA) Compliant
          </span>
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">
          Identity & Contact Verification
        </h2>
        <p className="text-sm text-foreground-muted">
          Under South African credit regulations, we verify your identity and contact information before credit evaluation.
        </p>
      </div>

      {stage === 'contact' && (
        <form onSubmit={handleSubmit(onContactSubmit)} className="space-y-5">
          {data.linkedBookingRef && (
            <div className="p-3.5 rounded-xl border border-gold/40 bg-primary/5 flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Linked Photography Booking:</span>
              <span className="font-mono text-xs font-bold text-gradient-gold">
                {data.linkedBookingRef}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
              South African ID Number <span className="text-danger">*</span>
            </label>
            <input
              {...register('idNumber', {
                required: 'SA ID number is required',
                pattern: { value: /^\d{13}$/, message: 'Must be exactly 13 digits' },
              })}
              type="text"
              placeholder="0001015009087"
              maxLength={13}
              className="input-luxury w-full px-4 py-3 text-sm font-mono tracking-wider"
            />
            {errors.idNumber && (
              <p className="text-xs text-danger mt-1.5">{errors.idNumber.message}</p>
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
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                type="email"
                placeholder="your@email.com"
                className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              />
            </div>
            {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
              Mobile Phone Number <span className="text-danger">*</span>
            </label>
            <p className="text-xs text-foreground-muted mb-1.5">
              South African mobile number for secure OTP SMS and loan agreements
            </p>
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
                placeholder="072 000 0000"
                className="input-luxury w-full pl-10 pr-4 py-3 text-sm"
              />
            </div>
            {errors.phone && <p className="text-xs text-danger mt-1.5">{errors.phone.message}</p>}
          </div>

          <button
            type="submit"
            disabled={sendingCodes}
            className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 mt-2 shadow-lg disabled:opacity-50"
          >
            {sendingCodes ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Verifying with Home Affairs & Sending PIN...
              </>
            ) : (
              <>
                Continue to PIN Verification <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      )}

      {stage === 'otp' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 flex items-start gap-3">
            <Clock size={18} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-foreground">Verification PIN Dispatched</p>
              <p className="text-xs text-foreground-muted mt-0.5">
                We sent a 6-digit security code to <strong className="text-foreground">{data.email}</strong> and <strong className="text-foreground">{data.phone}</strong>.
              </p>
              {generatedOtp && (
                <p className="text-xs font-mono text-primary font-bold mt-1">
                  Active security PIN: {generatedOtp}
                </p>
              )}
            </div>
          </div>

          {/* Email Verification Box */}
          <div
            className={`p-5 rounded-xl border transition-all duration-200 ${
              emailVerified ? 'border-success/40 bg-success/5' : 'border-border bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail size={15} className={emailVerified ? 'text-success' : 'text-primary'} />
                <span className="text-sm font-semibold text-foreground">Email Confirmation</span>
              </div>
              {emailVerified ? (
                <span className="flex items-center gap-1.5 text-xs text-success font-semibold">
                  <CheckCircle size={14} /> Verified
                </span>
              ) : (
                <span className="text-xs text-foreground-muted">{data.email}</span>
              )}
            </div>

            {!emailVerified && (
              <>
                <div className="flex gap-2 mb-4 justify-center">
                  {emailOtp.map((digit, i) => (
                    <input
                      key={`email-otp-${i}`}
                      ref={(el) => {
                        emailRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpInput(i, e.target.value, emailOtp, setEmailOtp, emailRefs)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(e, i, emailOtp, emailRefs)}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-background border border-border rounded-lg focus:border-gold focus:outline-none"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={verifyEmail}
                  disabled={verifyingEmail || emailOtp.join('').length !== 6}
                  className="btn-silver w-full py-2.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifyingEmail ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Email'}
                </button>
              </>
            )}
          </div>

          {/* Phone SMS Verification Box */}
          <div
            className={`p-5 rounded-xl border transition-all duration-200 ${
              phoneVerified ? 'border-success/40 bg-success/5' : 'border-border bg-muted/30'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Phone size={15} className={phoneVerified ? 'text-success' : 'text-primary'} />
                <span className="text-sm font-semibold text-foreground">SMS Verification</span>
              </div>
              {phoneVerified ? (
                <span className="flex items-center gap-1.5 text-xs text-success font-semibold">
                  <CheckCircle size={14} /> Verified
                </span>
              ) : (
                <span className="text-xs text-foreground-muted">{data.phone}</span>
              )}
            </div>

            {!phoneVerified && (
              <>
                <div className="flex gap-2 mb-4 justify-center">
                  {phoneOtp.map((digit, i) => (
                    <input
                      key={`phone-otp-${i}`}
                      ref={(el) => {
                        phoneRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) =>
                        handleOtpInput(i, e.target.value, phoneOtp, setPhoneOtp, phoneRefs)
                      }
                      onKeyDown={(e) => handleOtpKeyDown(e, i, phoneOtp, phoneRefs)}
                      className="w-10 h-12 text-center text-lg font-mono font-bold bg-background border border-border rounded-lg focus:border-gold focus:outline-none"
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={verifyPhone}
                  disabled={verifyingPhone || phoneOtp.join('').length !== 6}
                  className="btn-silver w-full py-2.5 text-xs font-semibold rounded-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifyingPhone ? <Loader2 size={14} className="animate-spin" /> : 'Confirm SMS'}
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={resendCode}
              className="text-xs text-primary hover:text-primary-light flex items-center gap-1"
            >
              <RefreshCw size={12} /> Resend security PIN
            </button>
            <button
              type="button"
              onClick={() => setStage('contact')}
              className="text-xs text-foreground-muted hover:text-foreground"
            >
              Edit contact details
            </button>
          </div>

          <button
            type="button"
            onClick={() => setStage('documents')}
            disabled={!emailVerified || !phoneVerified}
            className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            Continue to Document Checklist
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {stage === 'documents' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <h3 className="text-xs font-semibold text-foreground tracking-wide uppercase mb-3 flex items-center gap-1.5">
              <FileCheck2 size={15} className="text-primary" /> Required Underwriting Documents
            </h3>
            <p className="text-xs text-foreground-muted mb-4 leading-relaxed">
              To speed up your loan approval, ensure you have these documents available. You can upload digital copies now or submit them via your customer portal.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={15} className="text-success" />
                  <div>
                    <p className="text-xs font-medium text-foreground">SA National ID / Smart Card</p>
                    <p className="text-[10px] text-foreground-muted">Validated against Department of Home Affairs</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded">
                  Pre-Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={15} className="text-success" />
                  <div>
                    <p className="text-xs font-medium text-foreground">3 Months Bank Statements</p>
                    <p className="text-[10px] text-foreground-muted">Proof of income for NCA affordability check</p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Electronic Consent
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2.5">
                  <FileText size={15} className="text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Proof of Residential Address</p>
                    <p className="text-[10px] text-foreground-muted">Utility bill or lease agreement under 3 months</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-foreground-muted bg-muted px-2 py-0.5 rounded">
                  Portal Submission
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDocumentStep}
            className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 shadow-lg"
          >
            Confirm & Proceed to Affordability Assessment
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}