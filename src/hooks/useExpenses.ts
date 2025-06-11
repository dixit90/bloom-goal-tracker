
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/App';
import { Expense } from '@/types/finance';
import { toast } from '@/hooks/use-toast';

export function useExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch expenses from database
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
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform database data to match our Expense type
      const transformedExpenses: Expense[] = data.map(expense => ({
        id: expense.id,
        amount: parseFloat(expense.amount),
        category: expense.category as Expense['category'],
        description: expense.description || undefined,
        date: expense.date.split('T')[0], // Convert to YYYY-MM-DD format
      }));

      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load expenses',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add expense to database
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
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Transform and add to local state
      const newExpense: Expense = {
        id: data.id,
        amount: parseFloat(data.amount),
        category: data.category as Expense['category'],
        description: data.description || undefined,
        date: data.date.split('T')[0],
      };

      setExpenses(prev => [newExpense, ...prev]);
      
      toast({
        title: "Expense Added",
        description: `$${expense.amount} spent on ${expense.category}`,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add expense',
      });
    }
  };

  // Delete expense from database
  const deleteExpense = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      toast({
        title: "Expense Deleted",
        description: "Your expense has been removed",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete expense',
      });
    }
  };

  // Fetch expenses when user changes
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
}
