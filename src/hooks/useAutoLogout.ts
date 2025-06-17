
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useAutoLogout() {
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let lastActivity = Date.now();

    const INACTIVITY_TIMEOUT = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    const resetTimer = () => {
      lastActivity = Date.now();
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        await supabase.auth.signOut();
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity",
        });
      }, INACTIVITY_TIMEOUT);
    };

    // Track user activity
    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, true);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity, true);
      });
    };
  }, []);
}
