'use client';

import { useState, useCallback } from 'react';
import { Home, Compass, Map, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useCapacitor } from '@/hooks/use-capacitor';
import { SignInScreen } from '@/components/screens/signin-screen';
import { HomeScreen } from '@/components/screens/home-screen';
import { ExploreScreen } from '@/components/screens/explore-screen';
import { TripsScreen } from '@/components/screens/trips-screen';
import { ProfileScreen } from '@/components/screens/profile-screen';
import { AdminScreen } from '@/components/screens/admin-screen';
import { DetailSheet } from '@/components/detail-sheet';
import type { Listing, Category } from '@/lib/types';

export type Tab = 'home' | 'explore' | 'trips' | 'profile';

export default function Page() {
  const { user, loading } = useAuth();
  useCapacitor();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [adminMode, setAdminMode] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [exploreCategory, setExploreCategory] = useState<Category | undefined>(undefined);

  const openDetail = useCallback((listing: Listing) => {
    setSelectedListing(listing);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => setDetailOpen(false), []);

  const navigateToExplore = useCallback((category?: Category) => {
    setExploreCategory(category);
    setActiveTab('explore');
  }, []);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'home', label: 'Home', icon: <Home className="h-[22px] w-[22px]" /> },
    { key: 'explore', label: 'Explore', icon: <Compass className="h-[22px] w-[22px]" /> },
    { key: 'trips', label: 'Trips', icon: <Map className="h-[22px] w-[22px]" /> },
    { key: 'profile', label: 'Profile', icon: <User className="h-[22px] w-[22px]" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!user) return <SignInScreen />;

  if (adminMode) return <AdminScreen onClose={() => setAdminMode(false)} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 flex items-center justify-center md:py-8">
      <div className="relative w-full h-screen md:h-[860px] md:w-[400px] bg-background md:rounded-[3rem] md:border-[10px] md:border-slate-900 md:shadow-2xl overflow-hidden flex flex-col">
        <div className="hidden md:flex absolute top-0 left-0 right-0 h-8 z-50 items-center justify-between px-8 pt-2 bg-transparent pointer-events-none">
          <span className="text-[11px] font-semibold text-foreground">9:41</span>
          <div className="absolute left-1/2 -translate-x-1/2 top-1 w-24 h-6 bg-slate-900 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-0 md:pt-8 pb-20">
          {activeTab === 'home' && (
            <HomeScreen
              onListingClick={openDetail}
              onCategoryClick={(cat) => navigateToExplore(cat)}
              onSeeAll={() => navigateToExplore(undefined)}
            />
          )}
          {activeTab === 'explore' && (
            <ExploreScreen onListingClick={openDetail} initialCategory={exploreCategory} />
          )}
          {activeTab === 'trips' && <TripsScreen onListingClick={openDetail} />}
          {activeTab === 'profile' && <ProfileScreen onAdminClick={() => setAdminMode(true)} />}
        </div>

        <nav className="absolute bottom-0 left-0 right-0 z-40 glass border-t border-border/40 safe-bottom">
          <div className="flex items-center justify-around px-2 py-2.5">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex flex-col items-center gap-1 px-5 py-1.5 rounded-2xl transition-all duration-300 relative',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className={cn('transition-all duration-300', active && 'scale-110 drop-shadow-sm')}>
                    {tab.icon}
                  </span>
                  <span className={cn('text-[10px] font-semibold tracking-wide', active ? 'opacity-100' : 'opacity-70')}>
                    {tab.label}
                  </span>
                  {active && <span className="absolute -bottom-0 h-1 w-8 rounded-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </nav>

        <DetailSheet listing={selectedListing} open={detailOpen} onClose={closeDetail} />
      </div>
    </div>
  );
}
