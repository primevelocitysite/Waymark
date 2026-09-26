'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Mail,
  Star,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  ArrowUpRight,
  Plus,
  X,
  Pencil,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatDate, formatDateShort } from '@/lib/format';
import {
  useAllBookings,
  usePayments,
  useEmailLogs,
  useAdminListings,
} from '@/hooks/use-data';
import { toast } from '@/hooks/use-toast';
import type { Booking, Payment, EmailLog, Listing, Category } from '@/lib/types';

type AdminTab = 'dashboard' | 'bookings' | 'listings' | 'emails';

export function AdminScreen({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<AdminTab>('dashboard');

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: 'bookings', label: 'Bookings', icon: <Calendar className="h-4 w-4" /> },
    { key: 'listings', label: 'Listings', icon: <Star className="h-4 w-4" /> },
    { key: 'emails', label: 'Emails', icon: <Mail className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 glass border-b border-border/40 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold">Admin Console</h1>
            <p className="text-[10px] text-muted-foreground">Waymark Management</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold hover:bg-muted/70 transition-colors"
        >
          <X className="h-3.5 w-3.5" /> Exit
        </button>
      </div>

      <div className="flex gap-1 px-5 py-3 border-b border-border/30 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors',
              tab === t.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5 max-w-5xl mx-auto">
        {tab === 'dashboard' && <DashboardTab />}
        {tab === 'bookings' && <BookingsTab />}
        {tab === 'listings' && <ListingsTab />}
        {tab === 'emails' && <EmailsTab />}
      </div>
    </div>
  );
}

function DashboardTab() {
  const { bookings, loading: bookingsLoading } = useAllBookings();
  const { payments, loading: paymentsLoading } = usePayments();
  const { listings } = useAdminListings();
  const { logs } = useEmailLogs();

  const totalRevenue = payments
    .filter((p) => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const paidBookings = bookings.filter((b) => b.payment_status === 'paid').length;
  const pendingBookings = bookings.filter((b) => b.payment_status === 'unpaid').length;
  const emailsSent = logs.filter((l) => l.status === 'sent').length;

  const categoryStats = listings.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Revenue" value={formatPrice(totalRevenue)} icon={<DollarSign className="h-5 w-5" />} color="bg-success/10 text-success" />
        <KpiCard label="Bookings" value={String(confirmedBookings)} icon={<Calendar className="h-5 w-5" />} color="bg-primary/10 text-primary" />
        <KpiCard label="Listings" value={String(listings.length)} icon={<Star className="h-5 w-5" />} color="bg-accent/10 text-accent" />
        <KpiCard label="Emails Sent" value={String(emailsSent)} icon={<Mail className="h-5 w-5" />} color="bg-warning/10 text-warning" />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-primary" /> Payment Status
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{paidBookings}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">{pendingBookings}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">{bookings.length - paidBookings - pendingBookings}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Other</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-primary" /> Listings by Category
        </h3>
        <div className="space-y-3">
          {Object.entries(categoryStats).map(([cat, count]) => {
            const pct = (count / listings.length) * 100;
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold capitalize">{cat}</span>
                  <span className="text-muted-foreground">{count} listings</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" /> Recent Bookings
        </h3>
        {bookingsLoading ? (
          <div className="shimmer h-20 rounded-xl" />
        ) : bookings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {b.listing && <img src={b.listing.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-1">{b.listing?.title || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{b.booker_name} · {formatDateShort(b.check_in)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold">{formatPrice(b.total_price)}</p>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full', b.payment_status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>
                    {b.payment_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingsTab() {
  const { bookings, loading } = useAllBookings();

  return (
    <div>
      <h2 className="font-bold text-base mb-4">All Bookings ({bookings.length})</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-20 rounded-xl" />)}
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No bookings recorded.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                  {b.listing && <img src={b.listing.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-1">{b.listing?.title || 'Unknown listing'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.booker_name} · {b.booker_email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs">
                    <span className="text-muted-foreground">{formatDate(b.check_in)} → {formatDate(b.check_out)}</span>
                    <span className="text-muted-foreground">{b.guests} guests</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm">{formatPrice(b.total_price)}</p>
                  <div className="flex flex-col items-end gap-1 mt-1">
                    <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full', b.status === 'confirmed' ? 'bg-success/10 text-success' : b.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                      {b.status}
                    </span>
                    <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full', b.payment_status === 'paid' ? 'bg-success/10 text-success' : b.payment_status === 'unpaid' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground')}>
                      {b.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ListingFormData {
  title: string;
  category: Category;
  location: string;
  price: number;
  price_unit: string;
  rating: number;
  review_count: number;
  image_url: string;
  gallery: string[];
  amenities: string[];
  description: string;
  badge: string;
  bedrooms: number | null;
  bathrooms: number | null;
  guests: number | null;
  tags: string[];
  featured: boolean;
}

const EMPTY_FORM: ListingFormData = {
  title: '',
  category: 'hotels',
  location: '',
  price: 100,
  price_unit: 'night',
  rating: 4.5,
  review_count: 0,
  image_url: '',
  gallery: [],
  amenities: [],
  description: '',
  badge: '',
  bedrooms: null,
  bathrooms: null,
  guests: null,
  tags: [],
  featured: false,
};

function listingToForm(l: Listing): ListingFormData {
  return {
    title: l.title,
    category: l.category,
    location: l.location,
    price: l.price,
    price_unit: l.price_unit,
    rating: l.rating,
    review_count: l.review_count,
    image_url: l.image_url,
    gallery: l.gallery,
    amenities: l.amenities,
    description: l.description,
    badge: l.badge || '',
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    guests: l.guests,
    tags: l.tags,
    featured: l.featured,
  };
}

function formToDb(data: ListingFormData): Record<string, unknown> {
  return {
    title: data.title,
    category: data.category,
    location: data.location,
    price: data.price,
    price_unit: data.price_unit,
    rating: data.rating,
    review_count: data.review_count,
    image_url: data.image_url,
    gallery: data.gallery,
    amenities: data.amenities,
    description: data.description,
    badge: data.badge || null,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    guests: data.guests,
    tags: data.tags,
    featured: data.featured,
  };
}

function ListingsTab() {
  const { listings, loading, deleteListing, toggleFeatured, addListing, updateListing } = useAdminListings();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [galleryInput, setGalleryInput] = useState('');

  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setAmenitiesInput('');
    setTagsInput('');
    setGalleryInput('');
    setShowForm(true);
  };

  const openEditForm = (listing: Listing) => {
    const f = listingToForm(listing);
    setForm(f);
    setEditingId(listing.id);
    setAmenitiesInput(f.amenities.join(', '));
    setTagsInput(f.tags.join(', '));
    setGalleryInput(f.gallery.join('\n'));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.location.trim() || !form.image_url.trim()) {
      toast({ title: 'Missing fields', description: 'Title, location, and image URL are required.', variant: 'destructive' });
      return;
    }

    const finalForm: ListingFormData = {
      ...form,
      amenities: amenitiesInput.split(',').map((s) => s.trim()).filter(Boolean),
      tags: tagsInput.split(',').map((s) => s.trim()).filter(Boolean),
      gallery: galleryInput.split('\n').map((s) => s.trim()).filter(Boolean),
    };

    setSaving(true);
    const dbData = formToDb(finalForm);

    if (editingId) {
      const { error } = await updateListing(editingId, dbData);
      if (error) {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Listing updated', description: `${finalForm.title} has been updated.` });
        closeForm();
      }
    } else {
      const { error } = await addListing(dbData);
      if (error) {
        toast({ title: 'Create failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Listing created', description: `${finalForm.title} has been added.` });
        closeForm();
      }
    }
    setSaving(false);
  };

  if (showForm) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-base">{editingId ? 'Edit Listing' : 'Add New Listing'}</h2>
          <button onClick={closeForm} className="p-2 rounded-lg bg-muted hover:bg-muted/70 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <FormField label="Title">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="hotels">Hotels</option>
                <option value="homes">Homes</option>
                <option value="flights">Flights</option>
                <option value="cars">Cars</option>
                <option value="yachts">Yachts</option>
              </select>
            </FormField>
            <FormField label="Location">
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Price">
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Price unit">
              <input value={form.price_unit} onChange={(e) => setForm({ ...form, price_unit: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Rating">
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
          </div>

          <FormField label="Image URL">
            <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://images.pexels.com/..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </FormField>

          <FormField label="Gallery URLs (one per line)">
            <textarea value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} rows={3}
              placeholder="https://images.pexels.com/...&#10;https://images.pexels.com/..."
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </FormField>

          <FormField label="Amenities (comma-separated)">
            <input value={amenitiesInput} onChange={(e) => setAmenitiesInput(e.target.value)}
              placeholder="Pool, WiFi, Spa, Gym"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </FormField>

          <FormField label="Tags (comma-separated)">
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              placeholder="luxury, beachfront, family"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </FormField>

          <FormField label="Description">
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </FormField>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Bedrooms">
              <input type="number" value={form.bedrooms ?? ''} onChange={(e) => setForm({ ...form, bedrooms: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Bathrooms">
              <input type="number" value={form.bathrooms ?? ''} onChange={(e) => setForm({ ...form, bathrooms: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Guests">
              <input type="number" value={form.guests ?? ''} onChange={(e) => setForm({ ...form, guests: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Badge (optional)">
              <input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Editor's Choice"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
            <FormField label="Review count">
              <input type="number" value={form.review_count} onChange={(e) => setForm({ ...form, review_count: Number(e.target.value) })}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </FormField>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm font-medium">Featured on homepage</span>
          </label>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : editingId ? 'Update listing' : 'Create listing'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-base">Manage Listings ({listings.length})</h2>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add listing
        </button>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-card border border-border rounded-2xl p-3 flex gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                <img src={l.image_url} alt={l.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm line-clamp-1">{l.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{l.category} · {l.location}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs font-bold">{formatPrice(l.price)}/{l.price_unit}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-accent text-accent" /> {l.rating}
                  </span>
                  {l.featured && (
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-accent/10 text-accent">Featured</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={() => openEditForm(l)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1 justify-center"
                >
                  <Pencil className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => toggleFeatured(l.id, l.featured)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors',
                    l.featured ? 'bg-accent/10 text-accent' : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  )}
                >
                  {l.featured ? 'Unfeature' : 'Feature'}
                </button>
                <button
                  onClick={() => deleteListing(l.id)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors flex items-center gap-1 justify-center"
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmailsTab() {
  const { logs, loading } = useEmailLogs();

  return (
    <div>
      <h2 className="font-bold text-base mb-4">Email Activity ({logs.length})</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="shimmer h-16 rounded-xl" />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12">
          <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No emails sent yet. Emails are triggered by bookings and saves.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="bg-card border border-border rounded-xl p-3 flex items-start gap-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', log.status === 'sent' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                <Mail className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold line-clamp-1">{log.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5">To: {log.recipient}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{log.type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-muted-foreground">{formatDate(log.created_at)}</span>
                </div>
              </div>
              <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0', log.status === 'sent' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function KpiCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
