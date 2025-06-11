
import { useEffect, useRef } from 'react';
import { useAuth } from '@/App';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export function useAutoLogout() {
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const INACTIVITY_TIME = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  const WARNING_TIME = 5.5 * 60 * 60 * 1000; // 5.5 hours for warning

  const logout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Session Expired",
      description: "You've been logged out due to inactivity",
    });
  };

  const showWarning = () => {
    toast({
      title: "Session Expiring Soon",
      description: "You'll be logged out in 30 minutes due to inactivity",
    });
  };

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (user) {
      // Set warning timer (30 minutes before logout)
      warningTimeoutRef.current = setTimeout(showWarning, WARNING_TIME);
      
      // Set logout timer
      timeoutRef.current = setTimeout(logout, INACTIVITY_TIME);
    }
  };

  useEffect(() => {
    if (!user) return;

    // Activity events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer on any activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user]);

  return null;
}
