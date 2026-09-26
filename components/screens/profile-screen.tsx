'use client';

import { useState } from 'react';
import {
  Settings,
  CreditCard,
  Shield,
  HelpCircle,
  Globe,
  Moon,
  Bell,
  Award,
  ChevronRight,
  LogOut,
  Gift,
  MapPin,
  LayoutDashboard,
  Mail,
  Plane,
  Heart,
  Wallet,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { contactSupport, useUserStats, useUserPayments, useUpdateProfile } from '@/hooks/use-data';
import { toast } from '@/hooks/use-toast';

export function ProfileScreen({ onAdminClick }: { onAdminClick: () => void }) {
  const { profile, user, signOut } = useAuth();
  const { stats } = useUserStats();
  const { cards } = useUserPayments();
  const { update } = useUpdateProfile();
  const [editingPrefs, setEditingPrefs] = useState(false);

  const fullName = profile?.full_name || user?.email?.split('@')[0] || 'Traveler';
  const email = profile?.email || user?.email || '';
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const avatarUrl = profile?.avatar_url;
  const rewardPoints = profile?.reward_points ?? 0;
  const loyaltyTier = profile?.loyalty_tier ?? 'Silver';
  const notificationsEnabled = profile?.notifications_enabled ?? true;
  const darkMode = profile?.dark_mode ?? false;
  const language = profile?.preferred_language ?? 'English (US)';

  const tierColors: Record<string, string> = {
    Silver: 'bg-slate-300/20 text-slate-400',
    Gold: 'bg-accent/15 text-accent',
    Platinum: 'bg-primary/15 text-primary',
  };

  const nextTier = loyaltyTier === 'Silver' ? 'Gold' : loyaltyTier === 'Gold' ? 'Platinum' : null;
  const tierThresholds: Record<string, number> = { Silver: 0, Gold: 10000, Platinum: 20000 };
  const currentThreshold = tierThresholds[loyaltyTier] || 0;
  const nextThreshold = nextTier ? tierThresholds[nextTier] : currentThreshold;
  const progressPct = nextTier ? Math.min(100, ((rewardPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100) : 100;
  const pointsUntil = nextTier ? Math.max(0, nextThreshold - rewardPoints) : 0;

  const handleToggleNotifications = async () => {
    const newVal = !notificationsEnabled;
    const { error } = await update({ notifications_enabled: newVal });
    if (error) {
      toast({ title: 'Update failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: newVal ? 'Notifications on' : 'Notifications off' });
    }
  };

  const handleToggleDarkMode = async () => {
    const newVal = !darkMode;
    const { error } = await update({ dark_mode: newVal });
    if (error) {
      toast({ title: 'Update failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: newVal ? 'Dark mode on' : 'Light mode on' });
    }
  };

  const handleContact = () => {
    contactSupport(fullName, email);
    toast({ title: 'Message sent', description: 'Our team will get back to you at ' + email });
  };

  const cardLabel = cards.length > 0
    ? `${cards[0].brand} ending ${cards[0].last4}`
    : 'No payment methods yet';

  return (
    <div className="px-4 pb-4">
      <div className="pt-4 mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      </div>

      {/* User card */}
      <div className="bg-card border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground text-xl font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base">{fullName}</h2>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1', tierColors[loyaltyTier] || tierColors.Silver)}>
                <Award className="h-3 w-3" /> {loyaltyTier}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <Plane className="h-3 w-3" /> {stats.totalTrips} trips
              </span>
            </div>
          </div>
        </div>

        {/* Reward points — live from profile */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Reward points</span>
            <span className="text-xs font-bold text-primary">{rewardPoints.toLocaleString()} pts</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {nextTier ? `${pointsUntil.toLocaleString()} points until ${nextTier}` : 'Maximum tier reached'}
          </p>
        </div>
      </div>

      {/* Quick stats — live from bookings */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Plane className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold">{stats.totalTrips}</p>
          <p className="text-[10px] text-muted-foreground">Trips</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Heart className="h-4 w-4 text-destructive mx-auto mb-1" />
          <p className="text-lg font-bold">{stats.savedCount}</p>
          <p className="text-[10px] text-muted-foreground">Saved</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <Wallet className="h-4 w-4 text-success mx-auto mb-1" />
          <p className="text-sm font-bold">${stats.totalSpent.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Spent</p>
        </div>
      </div>

      <button
        onClick={onAdminClick}
        className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl p-4 flex items-center gap-3 mb-5 hover:shadow-lg transition-shadow"
      >
        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-sm">Admin Console</p>
          <p className="text-xs text-primary-foreground/70">Manage listings, bookings & emails</p>
        </div>
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Account — live data */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">Account</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors border-b border-border/50">
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <CreditCard className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Payment methods</p>
              <p className="text-xs text-muted-foreground capitalize">{cardLabel}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors border-b border-border/50">
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <Globe className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Language & region</p>
              <p className="text-xs text-muted-foreground">{language}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
          <button
            onClick={handleToggleNotifications}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors border-b border-border/50"
          >
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <Bell className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">{notificationsEnabled ? 'Push & email' : 'Disabled'}</p>
            </div>
            <span className={cn('w-10 h-6 rounded-full transition-colors flex items-center px-0.5', notificationsEnabled ? 'bg-primary justify-end' : 'bg-muted justify-start')}>
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>
          <button
            onClick={handleToggleDarkMode}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Appearance</p>
              <p className="text-xs text-muted-foreground">{darkMode ? 'Dark' : 'Light'}</p>
            </div>
            <span className={cn('w-10 h-6 rounded-full transition-colors flex items-center px-0.5', darkMode ? 'bg-primary justify-end' : 'bg-muted justify-start')}>
              <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </span>
          </button>
        </div>
      </div>

      {/* Waymark Rewards — live */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">Waymark Rewards</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <Award className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Loyalty status</p>
              <p className="text-xs text-muted-foreground">{loyaltyTier} Member</p>
            </div>
            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase', tierColors[loyaltyTier] || tierColors.Silver)}>
              {loyaltyTier}
            </span>
          </div>
          <button
            onClick={() => toast({ title: 'Referral link copied', description: 'Share with friends to earn points!' })}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <Gift className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Refer a friend</p>
              <p className="text-xs text-muted-foreground">Earn 500 points per referral</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Support — live email */}
      <div className="mb-5">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">Support</h3>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={handleContact}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors border-b border-border/50"
          >
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <Mail className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Contact us</p>
              <p className="text-xs text-muted-foreground">support@waymarkatlas.sbs</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
          <button
            onClick={() => toast({ title: 'Help Center', description: 'FAQs and guides coming soon' })}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors border-b border-border/50"
          >
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <HelpCircle className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Help center</p>
              <p className="text-xs text-muted-foreground">FAQs & guides</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
          <button
            onClick={() => toast({ title: 'Privacy & Security', description: 'Manage your data settings' })}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors border-b border-border/50"
          >
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <Shield className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Privacy & security</p>
              <p className="text-xs text-muted-foreground">Manage your data</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
          <button
            onClick={() => setEditingPrefs(!editingPrefs)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors"
          >
            <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
              <Settings className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">Settings</p>
              <p className="text-xs text-muted-foreground">App preferences</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      </div>

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-destructive/20 text-destructive text-sm font-bold hover:bg-destructive/5 transition-colors mb-6"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <p className="text-center text-[10px] text-muted-foreground">Waymark Atlas v1.0.0</p>
    </div>
  );
}
