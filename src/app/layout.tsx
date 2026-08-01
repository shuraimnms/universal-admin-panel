import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import VisitorTrackingProvider from '@/components/providers/VisitorTrackingProvider';
import MainContent from '@/components/layout/MainContent';
import { Toaster } from 'sonner';
import { Metadata } from 'next';
import StructuredData from '@/components/StructuredData';
import PerformanceProvider from '@/components/providers/PerformanceProvider';
import { SiteProvider } from '@/contexts/SiteContext';

export const metadata: Metadata = {
  title: {
    default: 'Universal Admin Panel',
    template: '%s | Universal Admin Panel'
  },
  description: 'Universal Admin Panel for managing multiple academic journals, conferences, and publications.',
  keywords: 'admin panel, academic journals, management, universal admin',
  authors: [{ name: 'System Administrator' }],
  creator: 'System Administrator',
  publisher: 'Universal Admin Panel',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Universal Admin Panel',
    title: 'Universal Admin Panel',
    description: 'Universal Admin Panel for managing multiple academic journals.',
    images: []
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Universal Admin Panel',
    description: 'Universal Admin Panel for managing multiple academic journals.',
    images: []
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className="font-sans min-h-screen bg-[#030712] text-slate-100 antialiased" suppressHydrationWarning>
        <PerformanceProvider>
          <SessionProvider>
            <SiteProvider>
              <VisitorTrackingProvider>
                <div className="flex flex-col min-h-screen">
                  <div className="flex-1">
                    <MainContent>
                      {children}
                    </MainContent>
                  </div>
                </div>
                <Toaster />
              </VisitorTrackingProvider>
            </SiteProvider>
          </SessionProvider>
        </PerformanceProvider>
      </body>
    </html>
  );
}