export type Category = 'flights' | 'hotels' | 'homes' | 'cars' | 'yachts';

export type BookingStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface Listing {
  id: string;
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
  badge: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  guests: number | null;
  tags: string[];
  featured: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  listing_id: string;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  booker_name: string;
  booker_email: string;
  created_at: string;
  listing?: Listing;
}

export interface SavedListing {
  id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  method: string;
  card_last4: string | null;
  card_brand: string | null;
  billing_name: string;
  billing_email: string;
  billing_address: string | null;
  billing_city: string | null;
  billing_zip: string | null;
  billing_country: string | null;
  status: 'succeeded' | 'pending' | 'failed' | 'refunded';
  created_at: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  body: string;
  status: 'sent' | 'failed';
  related_id: string | null;
  created_at: string;
}

export interface CategoryInfo {
  key: Category;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { key: 'hotels', label: 'Hotels', icon: 'Hotel', color: '#1B3A5C', bgColor: '#E8EDF3' },
  { key: 'homes', label: 'Homes', icon: 'Home', color: '#2D6A4F', bgColor: '#E4F0EB' },
  { key: 'flights', label: 'Flights', icon: 'Plane', color: '#9A6A00', bgColor: '#F5EBD8' },
  { key: 'cars', label: 'Cars', icon: 'Car', color: '#A02C2C', bgColor: '#F5E4E4' },
  { key: 'yachts', label: 'Yachts', icon: 'Sailboat', color: '#0F4C75', bgColor: '#E0EDF5' },
];
