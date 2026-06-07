'use client';
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Phone, ArrowRight, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { LoanData } from './LoanWizard';
import Icon from '@/components/ui/AppIcon';


interface Props {
  data: LoanData;
  updateData: (u: Partial<LoanData>) => void;
  onNext: () => void;
}

interface ContactForm {
  email: string;
  phone: string;
}

// Backend integration point: replace mock OTP with Twilio SMS + email service
const MOCK_OTP = '482916';

export default function StepVerification({ data, updateData, onNext }: Props) {
  const [stage, setStage] = useState<'contact' | 'otp'>('contact');
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  const [phoneOtp, setPhoneOtp] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [sendingCodes, setSendingCodes] = useState(false);
  const emailRefs = useRef<(HTMLInputElement | null)[]>([]);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<ContactForm>({
    defaultValues: { email: data.email, phone: data.phone },
  });

  const onContactSubmit = (values: ContactForm) => {
    setSendingCodes(true);
    updateData({ email: values.email, phone: values.phone });
    // Backend integration point: send OTP via email and Twilio SMS
    setTimeout(() => {
      setSendingCodes(false);
      setStage('otp');
      toast.success('Verification codes sent to your email and phone');
    }, 1500);
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
      if (entered === MOCK_OTP) {
        setEmailVerified(true);
        updateData({ emailVerified: true });
        toast.success('Email verified successfully');
      } else {
        toast.error('Incorrect code — demo code is 482916');
      }
    }, 1000);
  };

  const verifyPhone = () => {
    const entered = phoneOtp.join('');
    setVerifyingPhone(true);
    setTimeout(() => {
      setVerifyingPhone(false);
      if (entered === MOCK_OTP) {
        setPhoneVerified(true);
        updateData({ phoneVerified: true });
        toast.success('Phone number verified successfully');
      } else {
        toast.error('Incorrect code — demo code is 482916');
      }
    }, 1000);
  };

  const OtpInput = ({
    label,
    icon: Icon,
    arr,
    setArr,
    refs,
    verified,
    verifying,
    onVerify,
    contact,
  }: {
    label: string;
    icon: React.ElementType;
    arr: string[];
    setArr: React.Dispatch<React.SetStateAction<string[]>>;
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    verified: boolean;
    verifying: boolean;
    onVerify: () => void;
    contact: string;
  }) => (
    <div className={`p-5 rounded-xl border transition-all duration-200 ${verified ? 'border-success/40 bg-success/5' : 'border-border bg-muted/30'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={15} className={verified ? 'text-success' : 'text-primary'} />
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        {verified ? (
          <span className="flex items-center gap-1.5 text-xs text-success font-semibold">
            <CheckCircle size={13} />
            Verified
          </span>
        ) : (
          <span className="text-xs text-foreground-muted">{contact}</span>
        )}
      </div>

      {!verified && (
        <>
          <div className="flex gap-2 mb-4 justify-center">
            {arr.map((digit, i) => (
              <input
                key={`otp-${label}-${i}`}
                ref={(el) => { refs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpInput(i, e.target.value, arr, setArr, refs)}
                onKeyDown={(e) => handleOtpKeyDown(e, i, arr, refs)}
                className="w-10 h-12 text-center text-lg font-bold input-luxury rounded-lg focus:border-primary"
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-foreground-muted hover:text-primary transition-colors"
              onClick={() => toast.info('New code sent — demo: 482916')}
            >
              <RefreshCw size={11} />
              Resend code
            </button>
            <button
              type="button"
              onClick={onVerify}
              disabled={arr.some((d) => !d) || verifying}
              className="btn-gold px-4 py-2 text-xs font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {verifying ? <Loader2 size={12} className="animate-spin" /> : null}
              Verify
            </button>
          </div>
          <p className="text-[10px] text-foreground-muted mt-3 text-center">Demo OTP: <span className="text-primary font-mono font-semibold">482916</span></p>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-2xl p-7 lg:p-8">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-1">Verify Your Identity</h2>
        <p className="text-sm text-foreground-muted">No account required. We&apos;ll send a one-time code to confirm your contact details.</p>
      </div>

      {stage === 'contact' ? (
        <form onSubmit={handleSubmit(onContactSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-foreground-muted tracking-wide uppercase mb-1.5">
              Email Address <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
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
              Mobile Number <span className="text-danger">*</span>
            </label>
            <p className="text-xs text-foreground-muted mb-1.5">South African number starting with 0 or +27</p>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: { value: /^(\+27|0)[6-8][0-9]{8}$/, message: 'Enter a valid SA mobile number' },
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
            className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 mt-2"
          >
            {sendingCodes ? (
              <><Loader2 size={16} className="animate-spin" /> Sending codes...</>
            ) : (
              <>Send Verification Codes <ArrowRight size={15} /></>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-foreground-muted mb-5">
            Enter the 6-digit codes sent to <span className="text-foreground font-medium">{data.email}</span> and <span className="text-foreground font-medium">{data.phone}</span>.
          </p>

          <OtpInput
            label="Email Verification"
            icon={Mail}
            arr={emailOtp}
            setArr={setEmailOtp}
            refs={emailRefs}
            verified={emailVerified}
            verifying={verifyingEmail}
            onVerify={verifyEmail}
            contact={data.email}
          />

          <OtpInput
            label="Phone Verification"
            icon={Phone}
            arr={phoneOtp}
            setArr={setPhoneOtp}
            refs={phoneRefs}
            verified={phoneVerified}
            verifying={verifyingPhone}
            onVerify={verifyPhone}
            contact={data.phone}
          />

          <button
            type="button"
            onClick={onNext}
            disabled={!emailVerified || !phoneVerified}
            className="btn-gold w-full py-3.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Eligibility
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}