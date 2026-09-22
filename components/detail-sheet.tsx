'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Star,
  MapPin,
  Heart,
  Users,
  Bed,
  Bath,
  Check,
  Calendar,
  Minus,
  Plus,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatRating, nightsBetween } from '@/lib/format';
import { useSavedListings } from '@/hooks/use-data';
import { CheckoutSheet } from '@/components/checkout-sheet';
import type { Listing } from '@/lib/types';

export function DetailSheet({
  listing,
  open,
  onClose,
}: {
  listing: Listing | null;
  open: boolean;
  onClose: () => void;
}) {
  const { savedIds, toggleSave } = useSavedListings();
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setGalleryIndex(0);
      setGuests(2);
      const today = new Date();
      const inDate = new Date(today.getTime() + 7 * 86400000);
      const outDate = new Date(today.getTime() + 12 * 86400000);
      setCheckIn(inDate.toISOString().split('T')[0]);
      setCheckOut(outDate.toISOString().split('T')[0]);
    }
  }, [open, listing]);

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

  const isSaved = listing ? savedIds.has(listing.id) : false;

  if (!open || !listing) return null;

  const gallery = listing.gallery.length > 0 ? listing.gallery : [listing.image_url];

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-50 animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[92%] overflow-y-auto no-scrollbar animate-slide-up shadow-2xl">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-3 pb-2 rounded-t-3xl">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto" />
          <button
            onClick={onClose}
            className="absolute right-4 top-3 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pb-6">
          <div className="px-4">
            <div className="relative h-[240px] rounded-2xl overflow-hidden bg-muted">
              <img src={gallery[galleryIndex]} alt={listing.title} className="h-full w-full object-cover" />
              {listing.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> {listing.badge}
                </span>
              )}
              <button
                onClick={() => toggleSave(listing.id)}
                className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110 active:scale-95"
              >
                <Heart className={cn('h-5 w-5', isSaved ? 'fill-destructive text-destructive' : 'text-foreground')} />
              </button>
              {gallery.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setGalleryIndex(i)}
                      className={cn('h-1.5 rounded-full transition-all', i === galleryIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50')}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-5 mt-4">
            <h2 className="text-xl font-bold leading-tight">{listing.title}</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="text-sm font-bold">{formatRating(listing.rating)}</span>
                <span className="text-xs text-muted-foreground">({listing.review_count} reviews)</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {listing.location}
              </p>
            </div>
          </div>

          {(listing.bedrooms || listing.bathrooms || listing.guests) && (
            <div className="px-5 mt-4">
              <div className="flex gap-3">
                {listing.guests && (
                  <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center">
                    <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Guests</p>
                    <p className="font-bold text-sm">{listing.guests}</p>
                  </div>
                )}
                {listing.bedrooms && (
                  <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center">
                    <Bed className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                    <p className="font-bold text-sm">{listing.bedrooms}</p>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex-1 bg-muted/50 rounded-xl p-3 text-center">
                    <Bath className="h-5 w-5 mx-auto text-primary mb-1" />
                    <p className="text-xs text-muted-foreground">Baths</p>
                    <p className="font-bold text-sm">{listing.bathrooms}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="px-5 mt-5">
            <h3 className="font-bold text-sm mb-2">About this place</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          {listing.amenities.length > 0 && (
            <div className="px-5 mt-5">
              <h3 className="font-bold text-sm mb-3">What this place offers</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-foreground/80">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-5 mt-6">
            <h3 className="font-bold text-sm mb-3">Select dates & guests</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Check in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1 mb-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Check out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3.5 mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Guests</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="p-1.5 rounded-full border border-border hover:bg-background transition-colors disabled:opacity-30"
                  disabled={guests <= 1}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="font-bold text-sm w-6 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(listing.guests || 20, guests + 1))}
                  className="p-1.5 rounded-full border border-border hover:bg-background transition-colors disabled:opacity-30"
                  disabled={listing.guests ? guests >= listing.guests : false}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-muted/30 rounded-2xl p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  {formatPrice(listing.price)} × {listing.category === 'flights' ? `${guests} guests` : `${nights} nights`}
                </span>
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

            <button
              onClick={() => setCheckoutOpen(true)}
              disabled={!checkIn || !checkOut}
              className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Book now <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <CheckoutSheet
        listing={listing}
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          onClose();
        }}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    </>
  );
}
