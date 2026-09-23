'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Listing, Booking, SavedListing, Payment, EmailLog, Category } from '@/lib/types';

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
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (cancelled) return;

      if (error) {
        setError(error.message);
        setListings([]);
      } else {
        setListings((data || []) as unknown as Listing[]);
      }
      setLoading(false);
    }

    fetchListings();

    return () => {
      cancelled = true;
    };
  }, [category]);

  return { listings, loading, error };
}

export function useFeaturedListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeatured() {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('featured', true)
        .order('rating', { ascending: false });

      if (cancelled) return;
      setListings((data || []) as unknown as Listing[]);
      setLoading(false);
    }

    fetchFeatured();

    return () => {
      cancelled = true;
    };
  }, []);

  return { listings, loading };
}

export function useListing(id: string | null) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setListing(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function fetchListing() {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id as string)
        .maybeSingle();

      if (cancelled) return;
      setListing(data as unknown as Listing | null);
      setLoading(false);
    }

    fetchListing();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { listing, loading };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, listing:listings(*)')
      .order('check_in', { ascending: true });

    setBookings((data || []) as unknown as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, refetch: fetchBookings };
}

export function useSavedListings() {
  const [saved, setSaved] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const fetchSaved = useCallback(async () => {
    const { data } = await supabase
      .from('saved_listings')
      .select('*, listing:listings(*)')
      .order('created_at', { ascending: false });

    const items = (data || []) as unknown as SavedListing[];
    setSaved(items);
    setSavedIds(new Set(items.map((s) => s.listing_id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const toggleSave = useCallback(
    async (listingId: string) => {
      const wasSaved = savedIds.has(listingId);
      if (wasSaved) {
        await supabase.from('saved_listings').delete().eq('listing_id', listingId);
      } else {
        await supabase.from('saved_listings').insert({ listing_id: listingId });
        // Send save notification email
        try {
          const { data: listing } = await supabase
            .from('listings')
            .select('title')
            .eq('id', listingId)
            .maybeSingle() as any;

          if (listing) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
            await fetch(`${supabaseUrl}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
              },
              body: JSON.stringify({
                to: 'alex.rivera@waymark.app',
                subject: `You saved ${listing.title} — Waymark`,
                type: 'save_notification',
                listingTitle: listing.title,
                recipientName: 'Alex',
              }),
            });
          }
        } catch {
          // Email failure is non-fatal
        }
      }
      fetchSaved();
    },
    [savedIds, fetchSaved]
  );

  return { saved, savedIds, loading, toggleSave, refetch: fetchSaved };
}

export interface CheckoutParams {
  listing_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  booker_name: string;
  booker_email: string;
  // Payment
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
      // 1. Create the booking with payment_status = 'unpaid'
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

      // 2. Extract card info (simulated payment processing)
      const last4 = params.card_number.replace(/\s/g, '').slice(-4);
      const brand = detectCardBrand(params.card_number);

      // 3. Record payment
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

      // 4. Update booking payment_status to 'paid'
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking.id);

      // 5. Fetch listing title for email
      const { data: listing } = await supabase
        .from('listings')
        .select('title')
        .eq('id', params.listing_id)
        .maybeSingle() as any;

      // 6. Send confirmation email via edge function
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: params.booker_email,
            subject: `Booking Confirmed — ${listing?.title || 'Your trip'} | Waymark`,
            type: 'booking_confirmation',
            bookingId: booking.id,
            listingTitle: listing?.title || '',
            checkIn: params.check_in,
            checkOut: params.check_out,
            guests: params.guests,
            totalPrice: params.total_price,
            recipientName: params.booker_name,
          }),
        });
      } catch {
        // Email failure is non-fatal
      }

      setProcessing(false);
      return { success: true, bookingId: booking.id };
    } catch (err) {
      setProcessing(false);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  return { checkout, processing };
}

function detectCardBrand(number: string): string {
  const cleaned = number.replace(/\s/g, '');
  if (cleaned.startsWith('4')) return 'visa';
  if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
  if (cleaned.startsWith('3')) return 'amex';
  if (cleaned.startsWith('6')) return 'discover';
  return 'card';
}

// === Admin hooks ===

export function useAllBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, listing:listings(*)')
      .order('created_at', { ascending: false });
    setBookings((data || []) as unknown as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { bookings, loading, refetch: fetch };
}

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });
    setPayments((data || []) as unknown as Payment[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { payments, loading, refetch: fetch };
}

export function useEmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setLogs((data || []) as unknown as EmailLog[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { logs, loading, refetch: fetch };
}

export function useAdminListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false });
    setListings((data || []) as unknown as Listing[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const deleteListing = useCallback(async (id: string) => {
    await supabase.from('listings').delete().eq('id', id);
    fetch();
  }, [fetch]);

  const toggleFeatured = useCallback(async (id: string, current: boolean) => {
    await supabase.from('listings').update({ featured: !current }).eq('id', id);
    fetch();
  }, [fetch]);

  return { listings, loading, refetch: fetch, deleteListing, toggleFeatured };
}
