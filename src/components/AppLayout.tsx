'use client';

import { Header } from './Header';
import { AdSense } from './AdSense';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-4">
        {/* Anúncio lateral esquerdo */}
        <aside className="hidden lg:block w-[160px] sticky top-24">
          <AdSense
            adSlot="YOUR_LEFT_AD_SLOT"
            style={{ 
              display: 'block',
              minHeight: '600px'
            }}
          />
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1">
          {children}
        </main>

        {/* Anúncio lateral direito */}
        <aside className="hidden lg:block w-[160px] sticky top-24">
          <AdSense
            adSlot="YOUR_RIGHT_AD_SLOT"
            style={{ 
              display: 'block',
              minHeight: '600px'
            }}
          />
        </aside>
      </div>

      {/* Anúncio inferior */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <AdSense
          adSlot="YOUR_BOTTOM_AD_SLOT"
          style={{ 
            display: 'block',
            minHeight: '90px'
          }}
        />
      </div>
    </div>
  );
} 