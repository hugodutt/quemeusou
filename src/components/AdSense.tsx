'use client';

import { useEffect } from 'react';

type PushableArray = Array<object> & {
  push(obj: object): number;
};

declare global {
  interface Window {
    adsbygoogle: PushableArray;
  }
}

interface AdSenseProps {
  style?: React.CSSProperties;
  className?: string;
  adSlot: string;
}

export function AdSense({ style, className, adSlot }: AdSenseProps) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Error loading AdSense:', err);
    }
  }, []);

  return (
    <ins
      className={`adsbygoogle ${className || ''}`}
      style={style || { display: 'block' }}
      data-ad-client="ca-pub-1636692496327946"
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
} 