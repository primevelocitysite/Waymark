'use client';

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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { contactSupport } from '@/hooks/use-data';

export function ProfileScreen({ onAdminClick }: { onAdminClick: () => void }) {
  const { profile, user, signOut } = useAuth();

  const fullName = profile?.full_name || user?.email?.split('@')[0] || 'Traveler';
  const email = profile?.email || user?.email || 'user@waymarkatlas.sbs';
  const initials = fullName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const avatarUrl = profile?.avatar_url;

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: <CreditCard className="h-4 w-4" />, label: 'Payment methods', sub: 'Visa ending 3674' },
        { icon: <Globe className="h-4 w-4" />, label: 'Language & region', sub: 'English (US)' },
        { icon: <Bell className="h-4 w-4" />, label: 'Notifications', sub: 'Push, email' },
        { icon: <Moon className="h-4 w-4" />, label: 'Appearance', sub: 'Light' },
      ],
    },
    {
      title: 'Waymark Rewards',
      items: [
        { icon: <Award className="h-4 w-4" />, label: 'Loyalty status', sub: 'Gold Member' },
        { icon: <Gift className="h-4 w-4" />, label: 'Refer a friend', sub: 'Earn $50 credit' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: <Mail className="h-4 w-4" />, label: 'Contact us', sub: 'checkout@waymarkatlas.sbs', action: () => contactSupport(fullName, email) },
        { icon: <HelpCircle className="h-4 w-4" />, label: 'Help center', sub: 'FAQs & guides' },
        { icon: <Shield className="h-4 w-4" />, label: 'Privacy & security', sub: 'Manage your data' },
        { icon: <Settings className="h-4 w-4" />, label: 'Settings', sub: 'App preferences' },
      ],
    },
  ];

  return (
    <div className="px-4 pb-4">
      <div className="pt-4 mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      </div>

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
              <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                <Award className="h-3 w-3" /> Gold
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <MapPin className="h-3 w-3" /> San Francisco
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">Reward points</span>
            <span className="text-xs font-bold text-primary">12,450 pts</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: '62%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">3,550 points until Platinum</p>
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

      {menuSections.map((section) => (
        <div key={section.title} className="mb-5">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2.5 px-1">
            {section.title}
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {section.items.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => item.action?.()}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors',
                  idx !== section.items.length - 1 && 'border-b border-border/50'
                )}
              >
                <span className="w-9 h-9 rounded-xl bg-muted/60 flex items-center justify-center text-foreground flex-shrink-0">
                  {item.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={signOut}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-destructive/20 text-destructive text-sm font-bold hover:bg-destructive/5 transition-colors mb-6"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>

      <p className="text-center text-[10px] text-muted-foreground">Waymark v1.0.0</p>
    </div>
  );
}
