
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SavingsGoalData } from '@/types/finance';

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  description?: string;
  status: string;
}

export const useSavingsGoals = () => {
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoalData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSavingsGoals = async () => {
    if (!user) {
      setSavingsGoal(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching savings goals:', error);
        return;
      }

      if (data) {
        // Transform to match our SavingsGoalData type
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        setSavingsGoal({
          amount: Number(data.target_amount),
          month: currentMonth,
        });
      } else {
        setSavingsGoal(null);
      }
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSavingsGoal = async (goal: SavingsGoalData) => {
    if (!user) return;

    try {
      // Check if user has an existing active goal
      const { data: existingGoal } = await supabase
        .from('savings_goals')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const goalData = {
        user_id: user.id,
        name: `Monthly Savings Goal - ${goal.month}`,
        target_amount: goal.amount,
        current_amount: 0,
        target_date: new Date(goal.month + '-01').toISOString(),
        category: 'monthly',
        description: 'Monthly savings goal',
        status: 'active',
      };

      if (existingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('savings_goals')
          .update(goalData)
          .eq('id', existingGoal.id);

        if (error) {
          console.error('Error updating savings goal:', error);
          throw error;
        }
      } else {
        // Create new goal
        const { error } = await supabase
          .from('savings_goals')
          .insert([goalData]);

        if (error) {
          console.error('Error creating savings goal:', error);
          throw error;
        }
      }

      setSavingsGoal(goal);
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSavingsGoals();
  }, [user]);

  return {
    savingsGoal,
    loading,
    updateSavingsGoal,
    refetch: fetchSavingsGoals,
  };
};
