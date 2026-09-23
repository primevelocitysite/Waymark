'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Listing, Booking, SavedListing, Payment, EmailLog, Category } from '@/lib/types';

const COMPANY_DOMAIN = 'waymarkatlas.sbs';

export function getEmailAddress(prefix: string): string {
  return `${prefix}@${COMPANY_DOMAIN}`;
}

export function openMailto(to: string, subject: string, body: string) {
  const mailtoUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

function getCategoryEmailPrefix(category: string): string {
  const prefixes: Record<string, string> = {
    hotels: 'hotels',
    homes: 'homes',
    flights: 'flights',
    cars: 'cars',
    yachts: 'yachts',
  };
  return prefixes[category] || 'checkout';
}

function detectCardBrand(number: string): string {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'visa';
  if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
  if (cleaned.startsWith('3')) return 'amex';
  if (cleaned.startsWith('6')) return 'discover';
  return 'card';
}

export function contactSupport(userName: string, userEmail: string) {
  const to = getEmailAddress('checkout');
  const subject = 'Customer Inquiry — Waymark Atlas';
  const body = `Dear Waymark Atlas Support,

Customer inquiry from:
Name: ${userName}
Email: ${userEmail}

Please describe your request below:


Best regards,
${userName}
`;
  openMailto(to, subject, body);
}

export function useListings(category?: Category) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchListings() {
      setLoading(true);
      setError(null);
      let query = supabase.from('listings').select('*').order('rating', { ascending: false });
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (cancelled) return;
      if (error) { setError(error.message); setListings([]); }
      else setListings((data || []) as unknown as Listing[]);
      setLoading(false);
    }
    fetchListings();
    return () => { cancelled = true; };
  }, [category]);

  return { listings, loading, error };
}

export function useFeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchFeatured() {
      const { data } = await supabase.from('listings').select('*').eq('featured', true).order('rating', { ascending: false });
      if (cancelled) return;
      setListings((data || []) as unknown as Listing[]);
      setLoading(false);
    }
    fetchFeatured();
    return () => { cancelled = true; };
  }, []);

  return { listings, loading };
}

export function useListing(id: string | null) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setListing(null); return; }
    let cancelled = false;
    setLoading(true);
    async function fetchListing() {
      const { data } = await supabase.from('listings').select('*').eq('id', id as string).maybeSingle();
      if (cancelled) return;
      setListing(data as unknown as Listing | null);
      setLoading(false);
    }
    fetchListing();
    return () => { cancelled = true; };
  }, [id]);

  return { listing, loading };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('bookings').select('*, listing:listings(*)').order('check_in', { ascending: true });
    setBookings((data || []) as unknown as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  return { bookings, loading, refetch: fetchBookings };
}

export function useSavedListings() {
  const [saved, setSaved] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchSaved = useCallback(async () => {
    const { data } = await supabase.from('saved_listings').select('*, listing:listings(*)').order('created_at', { ascending: false });
    const items = (data || []) as unknown as SavedListing[];
    setSaved(items);
    setSavedIds(new Set(items.map((s) => s.listing_id)));
    setLoading(false);
  }, []);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const toggleSave = useCallback(async (listingId: string) => {
    const wasSaved = savedIds.has(listingId);
    if (wasSaved) {
      await supabase.from('saved_listings').delete().eq('listing_id', listingId);
    } else {
      await supabase.from('saved_listings').insert({ listing_id: listingId });
      try {
        const { data: listing } = await supabase.from('listings').select('title').eq('id', listingId).maybeSingle() as any;
        if (listing) {
          const to = getEmailAddress('saves');
          const subject = `Saved: ${listing.title} — Waymark Atlas`;
          const body = `You saved ${listing.title} to your wishlist on Waymark Atlas.\n\nBook it before someone else does!\n\nBest,\nThe Waymark Atlas Team`;
          openMailto(to, subject, body);
        }
      } catch { /* non-fatal */ }
    }
    fetchSaved();
  }, [savedIds, fetchSaved]);

  return { saved, savedIds, loading, toggleSave, refetch: fetchSaved };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(30);
    const items = (data || []) as any[];
    setNotifications(items);
    setUnreadCount(items.filter((n) => !n.read).length);
    setLoading(false);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, unreadCount, loading, refetch: fetchNotifications, markAllRead };
}

export interface CheckoutParams {
  listing_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  booker_name: string;
  booker_email: string;
  card_number: string;
  card_name: string;
  card_expiry: string;
  card_cvc: string;
  billing_address: string;
  billing_city: string;
  billing_zip: string;
  billing_country: string;
}

export function useCheckout() {
  const [processing, setProcessing] = useState(false);

  const checkout = useCallback(async (params: CheckoutParams) => {
    setProcessing(true);
    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          listing_id: params.listing_id,
          check_in: params.check_in,
          check_out: params.check_out,
          guests: params.guests,
          total_price: params.total_price,
          status: 'confirmed',
          payment_status: 'unpaid',
          booker_name: params.booker_name,
          booker_email: params.booker_email,
        })
        .select()
        .maybeSingle() as any;

      if (bookingError || !booking) {
        setProcessing(false);
        return { success: false, error: 'Failed to create booking' };
      }

      const last4 = params.card_number.replace(/\s/g, '').slice(-4);
      const brand = detectCardBrand(params.card_number);

      const { error: paymentError } = await supabase.from('payments').insert({
        booking_id: booking.id,
        amount: params.total_price,
        currency: 'USD',
        method: 'card',
        card_last4: last4,
        card_brand: brand,
        billing_name: params.card_name,
        billing_email: params.booker_email,
        billing_address: params.billing_address,
        billing_city: params.billing_city,
        billing_zip: params.billing_zip,
        billing_country: params.billing_country,
        status: 'succeeded',
      });

      if (paymentError) {
        setProcessing(false);
        return { success: false, error: 'Payment processing failed' };
      }

      await supabase.from('bookings').update({ payment_status: 'paid' }).eq('id', booking.id);

      const { data: listing } = await supabase
        .from('listings')
        .select('title, category')
        .eq('id', params.listing_id)
        .maybeSingle() as any;

      const confirmationId = `WM-${booking.id.slice(0, 8).toUpperCase()}`;
      const listingTitle = listing?.title || 'Your trip';
      const prefix = getCategoryEmailPrefix(listing?.category || 'hotels');
      const to = getEmailAddress(prefix);
      const subject = `Booking Confirmed — ${listingTitle} | Waymark Atlas`;
      const body = `Dear ${params.booker_name},

Your booking is confirmed! Here are your trip details:

Destination: ${listingTitle}
Check-in: ${params.check_in}
Check-out: ${params.check_out}
Guests: ${params.guests}
Confirmation ID: ${confirmationId}

Payment Summary:
- Card: ${brand} ending ${last4}
- Total Paid: $${params.total_price.toLocaleString()}

Billing Address:
${params.card_name}
${params.billing_address}
${params.billing_city}, ${params.billing_zip}
${params.billing_country}

Thank you for choosing Waymark Atlas!`;

      openMailto(to, subject, body);

      setProcessing(false);
      return { success: true, bookingId: booking.id, confirmationId };
    } catch {
      setProcessing(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  return { checkout, processing };
}

// === Admin hooks ===

export function useAllBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('bookings').select('*, listing:listings(*)').order('created_at', { ascending: false });
    setBookings((data || []) as unknown as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { bookings, loading, refetch };
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    setPayments((data || []) as unknown as Payment[]);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { payments, loading, refetch };
}

export function useEmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('email_logs').select('*').order('created_at', { ascending: false }).limit(50);
    setLogs((data || []) as unknown as EmailLog[]);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);
  return { logs, loading, refetch };
}

export function useAdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    setListings((data || []) as unknown as Listing[]);
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const deleteListing = useCallback(async (id: string) => {
    await supabase.from('listings').delete().eq('id', id);
    refetch();
  }, [refetch]);

  const toggleFeatured = useCallback(async (id: string, current: boolean) => {
    await supabase.from('listings').update({ featured: !current }).eq('id', id);
    refetch();
  }, [refetch]);

  return { listings, loading, refetch, deleteListing, toggleFeatured };
}
