'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatRating } from '@/lib/format';
import { useListings, useSavedListings } from '@/hooks/use-data';
import { ListingCard } from '@/components/listing-card';
import { CATEGORIES } from '@/lib/types';
import type { Listing, Category } from '@/lib/types';
import { Hotel, Home, Plane, Car, Sailboat, Heart } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Hotel: <Hotel className="h-4 w-4" />,
  Home: <Home className="h-4 w-4" />,
  Plane: <Plane className="h-4 w-4" />,
  Car: <Car className="h-4 w-4" />,
  Sailboat: <Sailboat className="h-4 w-4" />,
};

const SORT_OPTIONS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'price_low', label: 'Price: Low to High' },
  { key: 'price_high', label: 'Price: High to Low' },
  { key: 'reviews', label: 'Most reviewed' },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]['key'];

export function ExploreScreen({
  onListingClick,
  initialCategory,
}: {
  onListingClick: (listing: Listing) => void;
  initialCategory?: Category;
}) {
  const { listings, loading } = useListings();
  const { savedIds, toggleSave } = useSavedListings();
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  let filtered = listings;

  if (category !== 'all') {
    filtered = filtered.filter((l) => l.category === category);
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (l) => l.title.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
    );
  }

  filtered = filtered.filter((l) => l.price >= priceRange[0] && l.price <= priceRange[1]);

  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'reviews':
        return b.review_count - a.review_count;
      default:
        return b.rating - a.rating;
    }
  });

  return (
    <div className="px-4 pb-4">
      {/* Header */}
      <div className="pt-4 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Discover your next journey</p>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2.5 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations"
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'p-3 rounded-2xl border transition-colors',
            showFilters
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border text-foreground'
          )}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        <button
          onClick={() => setCategory('all')}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all',
            category === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/70'
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={cn(
              'px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all',
              category === cat.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            )}
          >
            {CATEGORY_ICONS[cat.icon]} {cat.label}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-scale-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Sort by</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-1 rounded-full hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 mb-4">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortBy(opt.key)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  sortBy === opt.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-foreground hover:bg-muted'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div>
            <h3 className="font-bold text-sm mb-3">Price range</h3>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="Min"
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full px-3 py-2 rounded-xl border border-border text-sm"
                placeholder="Max"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium">
          {filtered.length} {filtered.length === 1 ? 'place' : 'places'}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="shimmer h-[200px] rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm">
            No places match your filters.
          </p>
          <button
            onClick={() => {
              setCategory('all');
              setSearchQuery('');
              setPriceRange([0, 20000]);
            }}
            className="mt-3 text-sm font-semibold text-primary"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((listing) => {
            const isSaved = savedIds.has(listing.id);
            return (
              <button
                key={listing.id}
                onClick={() => onListingClick(listing)}
                className="group relative text-left animate-fade-in"
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
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur transition-transform hover:scale-110 active:scale-95"
                  >
                    <Heart
                      className={cn(
                        'h-3.5 w-3.5',
                        isSaved ? 'fill-destructive text-destructive' : 'text-foreground'
                      )}
                    />
                  </button>
                  {listing.badge && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[8px] font-bold text-primary uppercase">
                      {listing.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold mt-1.5 line-clamp-1">{listing.title}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 line-clamp-1">
                  <MapPin className="h-2.5 w-2.5" /> {listing.location}
                </p>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs font-bold">{formatPrice(listing.price)}</span>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-accent text-accent" />
                    <span className="text-[10px] font-bold">{formatRating(listing.rating)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
