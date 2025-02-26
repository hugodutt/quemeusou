import { useCallback } from 'react';
import { analytics } from '@/lib/firebase';
import { logEvent, Analytics } from 'firebase/analytics';

export function useAnalytics() {
  const trackEvent = useCallback(async (
    eventName: string,
    eventParams?: { [key: string]: any }
  ) => {
    try {
      // Adiciona um timeout para não bloquear indefinidamente
      const analyticsPromise = Promise.race([
        analytics,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Analytics timeout')), 2000)
        )
      ]);

      const analyticsInstance = await analyticsPromise;
      if (analyticsInstance) {
        logEvent(analyticsInstance as Analytics, eventName, eventParams);
      }
    } catch (error) {
      // Apenas loga o erro sem afetar a experiência do usuário
      console.error('Error tracking event:', error);
    }
  }, []);

  return { trackEvent };
} 