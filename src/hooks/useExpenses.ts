
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Expense } from '@/types/finance';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchExpenses = async () => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching expenses:', error);
        return;
      }

      // Transform database data to match our Expense type
      const transformedExpenses: Expense[] = data.map(expense => ({
        id: expense.id,
        amount: Number(expense.amount),
        category: expense.category as Expense['category'],
        description: expense.description,
        date: expense.date.split('T')[0], // Extract date part
      }));

      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([
          {
            user_id: user.id,
            amount: expense.amount,
            category: expense.category,
            description: expense.description || '',
            date: expense.date,
            type: 'expense', // Default type
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding expense:', error);
        throw error;
      }

      // Add to local state
      const newExpense: Expense = {
        id: data.id,
        amount: Number(data.amount),
        category: data.category as Expense['category'],
        description: data.description,
        date: data.date.split('T')[0],
      };

      setExpenses(prev => [newExpense, ...prev]);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting expense:', error);
        throw error;
      }

      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  return {
    expenses,
    loading,
    addExpense,
    deleteExpense,
    refetch: fetchExpenses,
  };
};
