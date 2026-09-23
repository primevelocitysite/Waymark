'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/format';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  created_at: string;
}

export function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    setNotifications((data || []) as unknown as Notification[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  const markAllRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    fetchNotifications();
  };

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <div className="absolute inset-0 bg-black/50 z-[60] animate-fade-in" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 z-[60] bg-background rounded-t-3xl max-h-[80%] overflow-y-auto no-scrollbar animate-slide-up shadow-2xl">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pt-3 pb-3 rounded-t-3xl border-b border-border/30">
          <div className="flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-bold text-base">Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-accent/15 text-accent text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="ml-5 mt-2 text-xs font-semibold text-primary flex items-center gap-1"
            >
              <Check className="h-3 w-3" /> Mark all as read
            </button>
          )}
        </div>

        <div className="px-4 py-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="shimmer h-20 rounded-2xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No notifications yet</p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Booking updates and alerts will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'rounded-2xl p-4 border transition-colors',
                    n.read
                      ? 'bg-card border-border/40'
                      : 'bg-primary/5 border-primary/20'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {!n.read && <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.body}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
