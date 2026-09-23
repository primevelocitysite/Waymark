import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Waymark — Travel Reimagined',
  description: 'Book flights, hotels, homes, cars, and yachts. Your journey starts here.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Waymark',
  },
  openGraph: {
    title: 'Waymark — Travel Reimagined',
    description: 'Book flights, hotels, homes, cars, and yachts. Your journey starts here.',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width' as const,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1B3A5C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
