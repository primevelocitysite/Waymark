'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Lock,
  CreditCard,
  Check,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  Mail,
  User,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, nightsBetween } from '@/lib/format';
import { useCheckout } from '@/hooks/use-data';
import { toast } from '@/hooks/use-toast';
import type { Listing } from '@/lib/types';

type Step = 'billing' | 'payment' | 'processing' | 'confirmed';

export function CheckoutSheet({
  listing,
  open,
  onClose,
  checkIn,
  checkOut,
  guests,
}: {
  listing: Listing | null;
  open: boolean;
  onClose: () => void;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const { checkout, processing } = useCheckout();
  const [step, setStep] = useState<Step>('billing');
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setStep('billing');
      setForm((prev) => ({
        ...prev,
        name: prev.name || 'Alex Rivera',
        email: prev.email || 'alex.rivera@waymark.app',
      }));
    }
  }, [open]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    return nightsBetween(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const subtotal = useMemo(() => {
    if (!listing) return 0;
    if (listing.category === 'flights') return listing.price * guests;
    return listing.price * nights;
  }, [listing, nights, guests]);

  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee + taxes;

  if (!open || !listing) return null;

  const validateBilling = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.zip.trim()) e.zip = 'ZIP is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e: Record<string, string> = {};
    if (!form.cardName.trim()) e.cardName = 'Cardholder name is required';
    const cardNum = form.cardNumber.replace(/\s/g, '');
    if (cardNum.length < 15) e.cardNumber = 'Invalid card number';
    if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) e.cardExpiry = 'MM/YY';
    if (form.cardCvc.length < 3) e.cardCvc = 'CVC';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handlePay = async () => {
    if (!validatePayment()) return;
    setStep('processing');

    const result = await checkout({
      listing_id: listing.id,
      check_in: checkIn,
      check_out: checkOut,
      guests,
      total_price: total,
      booker_name: form.name,
      booker_email: form.email,
      card_number: form.cardNumber,
      card_name: form.cardName,
      card_expiry: form.cardExpiry,
      card_cvc: form.cardCvc,
      billing_address: form.address,
      billing_city: form.city,
      billing_zip: form.zip,
      billing_country: form.country,
    });

    if (result.success) {
      setStep('confirmed');
      toast({ title: 'Payment successful!', description: `Confirmation email sent to ${form.email}` });
    } else {
      setStep('payment');
      toast({ title: 'Payment failed', description: result.error || 'Please try again.', variant: 'destructive' });
    }
  };

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-[60] animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 z-[60] bg-background rounded-t-3xl max-h-[94%] overflow-y-auto no-scrollbar animate-slide-up shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-3 pb-2 rounded-t-3xl border-b border-border/30">
          <div className="flex items-center justify-between px-5">
            {step === 'payment' ? (
              <button onClick={() => setStep('billing')} className="p-2 -ml-2 rounded-full hover:bg-muted">
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-8" />
            )}
            <div className="flex items-center gap-1.5">
              <div className={cn('h-1.5 rounded-full transition-all', step === 'billing' || step === 'payment' || step === 'processing' ? 'w-6 bg-primary' : 'w-1.5 bg-muted')} />
              <div className={cn('h-1.5 rounded-full transition-all', step === 'payment' || step === 'processing' ? 'w-6 bg-primary' : 'w-1.5 bg-muted')} />
              <div className={cn('h-1.5 rounded-full transition-all', step === 'confirmed' ? 'w-6 bg-success' : 'w-1.5 bg-muted')} />
            </div>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-1.5 font-medium">
            {step === 'billing' && 'Step 1 of 2 — Billing details'}
            {step === 'payment' && 'Step 2 of 2 — Payment'}
            {step === 'processing' && 'Processing payment...'}
            {step === 'confirmed' && 'Booking confirmed'}
          </p>
        </div>

        {step === 'confirmed' ? (
          <div className="px-6 py-10 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You're all set!</h2>
            <p className="text-muted-foreground text-sm mb-2">
              Your booking at {listing.title} is confirmed.
            </p>
            <p className="text-muted-foreground text-xs mb-6">
              A confirmation email has been sent to {form.email}
            </p>
            <div className="bg-muted/50 rounded-2xl p-5 text-left mb-6">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Destination</span>
                <span className="font-semibold text-right">{listing.title}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Dates</span>
                <span className="font-semibold">{checkIn} → {checkOut}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Guests</span>
                <span className="font-semibold">{guests}</span>
              </div>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground">Confirmation</span>
                <span className="font-semibold font-mono text-xs">WM-{Date.now().toString(36).toUpperCase().slice(-8)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold">Total Paid</span>
                <span className="font-bold text-primary">{formatPrice(total)}</span>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors">
              View in My Trips
            </button>
          </div>
        ) : step === 'processing' ? (
          <div className="px-6 py-20 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-6" />
            <h2 className="text-lg font-bold mb-1">Processing your payment</h2>
            <p className="text-muted-foreground text-sm">Securely charging your card...</p>
          </div>
        ) : (
          <div className="pb-6">
            {/* Order summary */}
            <div className="px-5 pt-4">
              <div className="bg-card border border-border rounded-2xl p-3 flex gap-3 mb-5">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-1">{listing.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {listing.location}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{checkIn}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{guests}</span>
                  </div>
                </div>
              </div>
            </div>

            {step === 'billing' && (
              <div className="px-5">
                <h3 className="font-bold text-sm mb-3">Billing details</h3>
                <div className="space-y-3">
                  <FormField label="Full name" icon={<User className="h-4 w-4" />} error={errors.name}>
                    <input
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Alex Rivera"
                      className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </FormField>
                  <FormField label="Email" icon={<Mail className="h-4 w-4" />} error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      placeholder="alex@example.com"
                      className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </FormField>
                  <FormField label="Street address" error={errors.address}>
                    <input
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      placeholder="123 Market Street"
                      className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="City" error={errors.city}>
                      <input
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        placeholder="San Francisco"
                        className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </FormField>
                    <FormField label="ZIP / Postal" error={errors.zip}>
                      <input
                        value={form.zip}
                        onChange={(e) => update('zip', e.target.value)}
                        placeholder="94103"
                        className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </FormField>
                  </div>
                  <FormField label="Country">
                    <select
                      value={form.country}
                      onChange={(e) => update('country', e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                      <option>Germany</option>
                      <option>France</option>
                      <option>Italy</option>
                      <option>Japan</option>
                      <option>UAE</option>
                    </select>
                  </FormField>
                </div>

                <PriceBreakdown subtotal={subtotal} serviceFee={serviceFee} taxes={taxes} total={total} />

                <button
                  onClick={() => validateBilling() && setStep('payment')}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-4"
                >
                  Continue to payment <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="px-5">
                <h3 className="font-bold text-sm mb-3">Payment method</h3>

                <div className="flex gap-2 mb-4">
                  <div className="flex-1 border-2 border-primary rounded-xl p-3 flex items-center gap-2 bg-primary/5">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-sm font-bold">Credit Card</span>
                  </div>
                  <div className="flex-1 border border-border rounded-xl p-3 flex items-center gap-2 opacity-40">
                    <span className="text-xs font-bold">Apple Pay</span>
                  </div>
                  <div className="flex-1 border border-border rounded-xl p-3 flex items-center gap-2 opacity-40">
                    <span className="text-xs font-bold">Google Pay</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <FormField label="Cardholder name" icon={<User className="h-4 w-4" />} error={errors.cardName}>
                    <input
                      value={form.cardName}
                      onChange={(e) => update('cardName', e.target.value)}
                      placeholder="ALEX RIVERA"
                      className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring uppercase"
                    />
                  </FormField>
                  <FormField label="Card number" icon={<CreditCard className="h-4 w-4" />} error={errors.cardNumber}>
                    <input
                      value={form.cardNumber}
                      onChange={(e) => update('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Expiry" error={errors.cardExpiry}>
                      <input
                        value={form.cardExpiry}
                        onChange={(e) => update('cardExpiry', formatExpiry(e.target.value))}
                        placeholder="12/28"
                        className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </FormField>
                    <FormField label="CVC" icon={<Lock className="h-4 w-4" />} error={errors.cardCvc}>
                      <input
                        value={form.cardCvc}
                        onChange={(e) => update('cardCvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="123"
                        className="w-full px-3 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 mb-2">
                  <Lock className="h-3.5 w-3.5 text-success" />
                  <p className="text-xs text-muted-foreground">Payments are encrypted and secure</p>
                </div>

                <PriceBreakdown subtotal={subtotal} serviceFee={serviceFee} taxes={taxes} total={total} />

                <button
                  onClick={handlePay}
                  disabled={processing}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" /> Pay {formatPrice(total)}
                </button>
                <p className="text-center text-xs text-muted-foreground mt-2">
                  By confirming, you agree to Waymark's Terms of Service
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function FormField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1.5">
        {icon} {label}
      </label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function PriceBreakdown({
  subtotal,
  serviceFee,
  taxes,
  total,
}: {
  subtotal: number;
  serviceFee: number;
  taxes: number;
  total: number;
}) {
  return (
    <div className="bg-muted/30 rounded-2xl p-4 mt-5">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">Service fee (8%)</span>
        <span className="font-medium">{formatPrice(serviceFee)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-muted-foreground">Taxes (5%)</span>
        <span className="font-medium">{formatPrice(taxes)}</span>
      </div>
      <div className="border-t border-border pt-2 mt-2 flex justify-between">
        <span className="font-bold">Total</span>
        <span className="font-bold text-primary text-lg">{formatPrice(total)}</span>
      </div>
    </div>
  );
}
