'use client';

import { useState } from 'react';
import {
  Search,
  Bell,
  Star,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { NotificationsSheet } from '@/components/notifications-sheet';
import { useNotifications } from '@/hooks/use-data';
import { cn } from '@/lib/utils';
import { formatPrice, formatRating, getGreeting } from '@/lib/format';
import { useListings, useFeaturedListings, useSavedListings } from '@/hooks/use-data';
import { ListingCard } from '@/components/listing-card';
import { CATEGORIES } from '@/lib/types';
import type { Listing, Category } from '@/lib/types';
import { Hotel, Home, Plane, Car, Sailboat, Heart, MapPin, Sparkles as SparklesIcon } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Hotel: <Hotel className="h-5 w-5" />,
  Home: <Home className="h-5 w-5" />,
  Plane: <Plane className="h-5 w-5" />,
  Car: <Car className="h-5 w-5" />,
  Sailboat: <Sailboat className="h-5 w-5" />,
};

export function HomeScreen({
  onListingClick,
  onCategoryClick,
  onSeeAll,
}: {
  onListingClick: (listing: Listing) => void;
  onCategoryClick: (category: Category) => void;
  onSeeAll: () => void;
}) {
  const { listings, loading } = useListings();
  const { listings: featured } = useFeaturedListings();
  const { saved } = useSavedListings();
  const { unreadCount } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const greeting = getGreeting();

  const filteredByCategory = selectedCategory
    ? listings.filter((l) => l.category === selectedCategory)
    : listings;

  const searched = searchQuery
    ? filteredByCategory.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByCategory;

  const topRated = [...listings].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const trending = listings.filter((l) => l.tags.includes('luxury')).slice(0, 6);
  const savedListings = saved
    .map((s) => s.listing)
    .filter(Boolean)
    .slice(0, 6) as Listing[];

  const heroListing = featured[0] || listings[0];

  return (
    <div className="px-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-5">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{greeting}</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">Let's explore</h1>
        </div>
        <button
          onClick={() => setNotifOpen(true)}
          className="relative p-2.5 rounded-full bg-muted/60 hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Where to next?"
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-border bg-card text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x mb-6 -mx-4 px-4">
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setSelectedCategory(active ? null : cat.key);
                if (!active) onCategoryClick(cat.key);
              }}
              className={cn(
                'flex flex-col items-center gap-2 snap-start flex-shrink-0 w-[72px]',
              )}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
                  active ? 'scale-105 shadow-lg' : 'hover:scale-105'
                )}
                style={{
                  backgroundColor: active ? cat.color : cat.bgColor,
                  color: active ? '#fff' : cat.color,
                }}
              >
                {CATEGORY_ICONS[cat.icon]}
              </div>
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Hero featured card */}
      {heroListing && !searchQuery && !selectedCategory && (
        <button
          onClick={() => onListingClick(heroListing)}
          className="relative w-full h-[320px] rounded-3xl overflow-hidden mb-6 group block text-left"
        >
          <img
            src={heroListing.image_url}
            alt={heroListing.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

          {/* Category icon overlay */}
          <div className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            {CATEGORY_ICONS[heroListing.category.charAt(0).toUpperCase() + heroListing.category.slice(1)] || <SparklesIcon className="h-6 w-6 text-white" />}
          </div>

          {/* Badge */}
          {heroListing.badge && (
            <span className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> {heroListing.badge}
            </span>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">
              Featured · {heroListing.category}
            </p>
            <h2 className="text-white text-xl font-bold leading-tight mb-1.5">
              {heroListing.title}
            </h2>
            <p className="text-white/80 text-sm flex items-center gap-1 mb-3">
              <MapPin className="h-3.5 w-3.5" /> {heroListing.location}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/15 backdrop-blur">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="text-white text-sm font-bold">
                    {formatRating(heroListing.rating)}
                  </span>
                </div>
                <span className="text-white/70 text-xs">
                  {heroListing.review_count} reviews
                </span>
              </div>
              <div className="text-right">
                <p className="text-white text-lg font-bold">
                  {formatPrice(heroListing.price)}
                </p>
                <p className="text-white/60 text-xs">/{heroListing.price_unit}</p>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* Search results */}
      {searchQuery || selectedCategory ? (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base">
              {searched.length} {searched.length === 1 ? 'result' : 'results'}
            </h3>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="text-xs font-semibold text-primary"
              >
                Clear
              </button>
            )}
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-[220px] rounded-2xl" />
              ))}
            </div>
          ) : searched.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No results found. Try another search.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {searched.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onClick={onListingClick} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Saved listings rail */}
          {savedListings.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  <Heart className="h-4 w-4 fill-destructive text-destructive" /> Saved
                </h3>
                <button onClick={onSeeAll} className="text-xs font-semibold text-primary flex items-center gap-0.5">
                  See all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x -mx-4 px-4">
                {savedListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={onListingClick}
                    variant="compact"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Top rated rail */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-accent text-accent" /> Top rated
              </h3>
              <button onClick={onSeeAll} className="text-xs font-semibold text-primary flex items-center gap-0.5">
                See all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x -mx-4 px-4">
              {topRated.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClick={onListingClick}
                  variant="wide"
                />
              ))}
            </div>
          </section>

          {/* Trending luxury rail */}
          {trending.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-base flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary" /> Trending in luxury
                </h3>
                <button onClick={onSeeAll} className="text-xs font-semibold text-primary flex items-center gap-0.5">
                  See all <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x -mx-4 px-4">
                {trending.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClick={onListingClick}
                    variant="wide"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Recommended for you — full cards */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-base">Recommended for you</h3>
              <button onClick={onSeeAll} className="text-xs font-semibold text-primary flex items-center gap-0.5">
                See all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="space-y-5">
              {listings.slice(0, 4).map((listing) => (
                <ListingCard key={listing.id} listing={listing} onClick={onListingClick} />
              ))}
            </div>
          </section>
        </>
      )}

      <NotificationsSheet open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
