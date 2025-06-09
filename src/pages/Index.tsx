
import React, { useState } from 'react';
import { Plus, TrendingUp, Calendar, PieChart, Target, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseHistory from '@/components/ExpenseHistory';
import SavingsGoal from '@/components/SavingsGoal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ExpenseCalendar from '@/components/ExpenseCalendar';
import DarkModeToggle from '@/components/DarkModeToggle';
import AuthDialog from '@/components/AuthDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { SavingsGoalData } from '@/types/finance';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { expenses, loading: expensesLoading, addExpense, deleteExpense } = useExpenses();
  const { savingsGoal, updateSavingsGoal } = useSavingsGoals();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAddExpense = async (expense: Omit<any, 'id'>) => {
    try {
      await addExpense(expense);
      setShowExpenseForm(false);
      toast({
        title: "Expense Added",
        description: `$${expense.amount} spent on ${expense.category}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      toast({
        title: "Expense Deleted",
        description: "Your expense has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSavingsGoal = async (goal: SavingsGoalData) => {
    try {
      await updateSavingsGoal(goal);
      toast({
        title: "Savings Goal Updated",
        description: `Monthly goal set to $${goal.amount}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update savings goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && 
           expenseDate.getFullYear() === now.getFullYear();
  });

  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
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
                onClick={() => setShowAuthDialog(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🌱</div>
            <h2 className="text-3xl font-bold mb-4">Welcome to BudgetBloom</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Take control of your finances and watch your financial awareness bloom. 
              Track expenses, set savings goals, and visualize your spending patterns.
            </p>
            <Button 
              onClick={() => setShowAuthDialog(true)}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Get Started
            </Button>
          </div>

          <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Budget<span className="text-emerald-500">Bloom</span>
            </h1>
            <p className="text-muted-foreground">Welcome back, {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <Button 
              onClick={() => setShowExpenseForm(true)}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
            <Button 
              onClick={handleSignOut}
              variant="outline"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
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
                onUpdateGoal={handleUpdateSavingsGoal}
              />
              <AnalyticsDashboard expenses={currentMonthExpenses} />
            </div>
          </TabsContent>

          <TabsContent value="expenses">
            <ExpenseHistory 
              expenses={expenses}
              onDeleteExpense={handleDeleteExpense}
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
