'use client';

import { Heart, Star, MapPin, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatRating } from '@/lib/format';
import { useSavedListings } from '@/hooks/use-data';
import type { Listing } from '@/lib/types';

export function ListingCard({
  listing,
  onClick,
  variant = 'default',
}: {
  listing: Listing;
  onClick: (listing: Listing) => void;
  variant?: 'default' | 'compact' | 'wide';
}) {
  const { savedIds, toggleSave } = useSavedListings();
  const isSaved = savedIds.has(listing.id);

  if (variant === 'wide') {
    return (
      <button
        onClick={() => onClick(listing)}
        className="group relative w-[280px] flex-shrink-0 snap-start text-left"
      >
        <div className="relative h-[200px] rounded-2xl overflow-hidden bg-muted">
          <img
            src={listing.image_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {listing.badge && (
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-primary uppercase tracking-wide">
              {listing.badge}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(listing.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110 active:scale-95"
          >
            <Heart
              className={cn('h-4 w-4', isSaved ? 'fill-destructive text-destructive' : 'text-foreground')}
            />
          </button>
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-sm font-semibold leading-tight line-clamp-1">
              {listing.title}
            </p>
            <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {listing.location}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="text-sm font-bold">{formatRating(listing.rating)}</span>
            <span className="text-xs text-muted-foreground">({listing.review_count})</span>
          </div>
          <p className="text-sm">
            <span className="font-bold">{formatPrice(listing.price)}</span>
            <span className="text-muted-foreground"> /{listing.price_unit}</span>
          </p>
        </div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={() => onClick(listing)}
        className="group relative w-[160px] flex-shrink-0 snap-start text-left"
      >
        <div className="relative h-[180px] rounded-2xl overflow-hidden bg-muted">
          <img
            src={listing.image_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(listing.id);
            }}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110 active:scale-95"
          >
            <Heart
              className={cn('h-3.5 w-3.5', isSaved ? 'fill-destructive text-destructive' : 'text-foreground')}
            />
          </button>
        </div>
        <p className="text-sm font-bold mt-2 line-clamp-1">{listing.title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{listing.location}</p>
        <p className="text-xs mt-1">
          <span className="font-bold">{formatPrice(listing.price)}</span>
          <span className="text-muted-foreground"> /{listing.price_unit}</span>
        </p>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick(listing)}
      className="group relative w-full text-left animate-fade-in"
    >
      <div className="relative h-[220px] rounded-2xl overflow-hidden bg-muted">
        <img
          src={listing.image_url}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {listing.badge && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
            <BadgeCheck className="h-3 w-3" /> {listing.badge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(listing.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110 active:scale-95"
        >
          <Heart
            className={cn('h-4 w-4', isSaved ? 'fill-destructive text-destructive' : 'text-foreground')}
          />
        </button>
      </div>
      <div className="flex items-start justify-between mt-3 gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm leading-tight line-clamp-1">{listing.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3 flex-shrink-0" /> {listing.location}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="text-sm font-bold">{formatRating(listing.rating)}</span>
        </div>
      </div>
      <p className="text-sm mt-1">
        <span className="font-bold">{formatPrice(listing.price)}</span>
        <span className="text-muted-foreground"> /{listing.price_unit}</span>
      </p>
    </button>
  );
}
