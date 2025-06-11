
import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, PieChart, Target, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseHistory from '@/components/ExpenseHistory';
import SavingsGoal from '@/components/SavingsGoal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ExpenseCalendar from '@/components/ExpenseCalendar';
import DarkModeToggle from '@/components/DarkModeToggle';
import { AuthDialog } from '@/components/AuthDialog';
import { useAuth } from '@/App';
import { supabase } from '@/lib/supabase';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useExpenses } from '@/hooks/useExpenses';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { Expense, SavingsGoalData } from '@/types/finance';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading } = useAuth();
  const { expenses, loading: expensesLoading, addExpense, deleteExpense } = useExpenses();
  const [savingsGoal, setSavingsGoal] = useLocalStorage<SavingsGoalData | null>('budgetbloom-savings-goal', null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWelcome, setShowWelcome] = useState(false);

  // Auto logout functionality
  useAutoLogout();

  useEffect(() => {
    if (user && !loading) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const handleAddExpense = async (expense: Omit<Expense, 'id'>) => {
    await addExpense(expense);
    setShowExpenseForm(false);
  };

  const updateSavingsGoal = (goal: SavingsGoalData) => {
    setSavingsGoal(goal);
    toast({
      title: "Savings Goal Updated",
      description: `Monthly goal set to $${goal.amount}`,
    });
  };

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading || expensesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Budget<span className="text-emerald-500">Bloom</span>
          </h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Header for non-authenticated users */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Budget<span className="text-emerald-500">Bloom</span>
              </h1>
              <p className="text-muted-foreground">Grow your financial awareness</p>
            </div>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <AuthDialog />
            </div>
          </div>

          {/* Welcome screen for non-authenticated users */}
          <div className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Welcome to BudgetBloom</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Track your expenses, set savings goals, and watch your financial awareness bloom.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Track Expenses</h3>
                  <p className="text-muted-foreground">Monitor your spending across different categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Set Goals</h3>
                  <p className="text-muted-foreground">Create savings goals and track your progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <PieChart className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Analyze Data</h3>
                  <p className="text-muted-foreground">Get insights into your spending patterns</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Welcome message */}
        {showWelcome && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
            <p className="text-emerald-800 dark:text-emerald-200 font-medium">
              Welcome back, {user.email}! Ready to manage your finances? 🌱
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Budget<span className="text-emerald-500">Bloom</span>
            </h1>
            <p className="text-muted-foreground">Grow your financial awareness</p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => setShowExpenseForm(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">${totalSpentThisMonth.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Savings Goal</p>
                  <p className="text-2xl font-bold">
                    ${savingsGoal ? savingsGoal.amount.toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <PieChart className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold">{expenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SavingsGoal 
                currentGoal={savingsGoal}
                totalSpent={totalSpentThisMonth}
                onUpdateGoal={updateSavingsGoal}
              />
              <AnalyticsDashboard expenses={currentMonthExpenses} />
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseHistory 
              expenses={expenses}
              onDeleteExpense={deleteExpense}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard expenses={currentMonthExpenses} detailed />
          </TabsContent>

          <TabsContent value="calendar">
            <ExpenseCalendar expenses={expenses} />
          </TabsContent>
        </Tabs>

        {/* Expense Form Modal */}
        {showExpenseForm && (
          <ExpenseForm 
            onSubmit={handleAddExpense}
            onCancel={() => setShowExpenseForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
