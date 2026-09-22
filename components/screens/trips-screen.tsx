'use client';

import { useMemo } from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  Plane,
  Hotel,
  Home,
  Car,
  Sailboat,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatDate, formatDateShort } from '@/lib/format';
import { useBookings } from '@/hooks/use-data';
import type { Listing, Category } from '@/lib/types';

const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  hotels: <Hotel className="h-4 w-4" />,
  homes: <Home className="h-4 w-4" />,
  flights: <Plane className="h-4 w-4" />,
  cars: <Car className="h-4 w-4" />,
  yachts: <Sailboat className="h-4 w-4" />,
};

export function TripsScreen({ onListingClick }: { onListingClick: (listing: Listing) => void }) {
  const { bookings, loading } = useBookings();

  const { upcoming, completed } = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter((b) => new Date(b.check_out) >= now && b.status !== 'cancelled');
    const completed = bookings.filter((b) => new Date(b.check_out) < now || b.status === 'completed');
    return { upcoming, completed };
  }, [bookings]);

  const totalSpent = completed.reduce((sum, b) => sum + b.total_price, 0);
  const totalTrips = bookings.length;

  return (
    <div className="px-4 pb-4">
      {/* Header */}
      <div className="pt-4 mb-5">
        <h1 className="text-2xl font-bold tracking-tight">My Trips</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your journey, all in one place</p>
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="bg-card border border-border rounded-2xl p-3.5 text-center">
          <p className="text-2xl font-bold text-primary">{totalTrips}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Total trips</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3.5 text-center">
          <p className="text-2xl font-bold text-primary">{upcoming.length}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Upcoming</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3.5 text-center">
          <p className="text-lg font-bold text-primary">{formatPrice(totalSpent)}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Spent</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-[120px] rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Plane className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-base mb-1">No trips yet</h3>
          <p className="text-sm text-muted-foreground">
            Your booked adventures will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section className="mb-6">
              <h3 className="font-bold text-base mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" /> Upcoming
              </h3>
              <div className="space-y-3">
                {upcoming.map((booking) => {
                  const listing = booking.listing;
                  if (!listing) return null;
                  return (
                    <button
                      key={booking.id}
                      onClick={() => onListingClick(listing)}
                      className="w-full bg-card border border-border rounded-2xl p-3 flex gap-3 text-left hover:shadow-md transition-shadow"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {CATEGORY_ICONS[listing.category]}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            {listing.category}
                          </span>
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-bold uppercase">
                            {booking.status}
                          </span>
                        </div>
                        <p className="font-bold text-sm line-clamp-1">{listing.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {listing.location}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateShort(booking.check_in)} — {formatDateShort(booking.check_out)}
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-3 w-3" /> {booking.guests}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section className="mb-6">
              <h3 className="font-bold text-base mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Past trips
              </h3>
              <div className="space-y-3">
                {completed.map((booking) => {
                  const listing = booking.listing;
                  if (!listing) return null;
                  return (
                    <div
                      key={booking.id}
                      className="w-full bg-muted/40 border border-border/60 rounded-2xl p-3 flex gap-3"
                    >
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={listing.image_url}
                          alt={listing.title}
                          className="h-full w-full object-cover opacity-80"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            {CATEGORY_ICONS[listing.category]}
                          </span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            {listing.category}
                          </span>
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[9px] font-bold uppercase">
                            Completed
                          </span>
                        </div>
                        <p className="font-bold text-sm line-clamp-1 text-muted-foreground">
                          {listing.title}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {listing.location}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateShort(booking.check_in)} — {formatDateShort(booking.check_out)}
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {formatPrice(booking.total_price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Activity / insight card */}
          <section className="mb-6">
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5" />
                <h3 className="font-bold text-sm">Travel insights</h3>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-primary-foreground/70">Countries visited</span>
                  <span className="font-bold">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-foreground/70">Nights booked</span>
                  <span className="font-bold">
                    {bookings.reduce((sum, b) => {
                      const nights = Math.round(
                        (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000
                      );
                      return sum + Math.max(1, nights);
                    }, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-primary-foreground/70">Avg. trip length</span>
                  <span className="font-bold">
                    {Math.round(
                      bookings.reduce((sum, b) => {
                        const nights = Math.round(
                          (new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000
                        );
                        return sum + Math.max(1, nights);
                      }, 0) / bookings.length
                    )} nights
                  </span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
