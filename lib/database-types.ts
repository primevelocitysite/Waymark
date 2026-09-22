export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          title: string;
          category: string;
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
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          location: string;
          price?: number;
          price_unit?: string;
          rating?: number;
          review_count?: number;
          image_url: string;
          gallery?: string[];
          amenities?: string[];
          description?: string;
          badge?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          guests?: number | null;
          tags?: string[];
          featured?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          location?: string;
          price?: number;
          price_unit?: string;
          rating?: number;
          review_count?: number;
          image_url?: string;
          gallery?: string[];
          amenities?: string[];
          description?: string;
          badge?: string | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          guests?: number | null;
          tags?: string[];
          featured?: boolean;
        };
      };
      bookings: {
        Row: {
          id: string;
          listing_id: string;
          check_in: string;
          check_out: string;
          guests: number;
          total_price: number;
          status: string;
          booker_name: string;
          booker_email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          check_in: string;
          check_out: string;
          guests?: number;
          total_price?: number;
          status?: string;
          booker_name?: string;
          booker_email?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          check_in?: string;
          check_out?: string;
          guests?: number;
          total_price?: number;
          status?: string;
          booker_name?: string;
          booker_email?: string;
        };
      };
      saved_listings: {
        Row: {
          id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
        };
      };
    };
  };
}
