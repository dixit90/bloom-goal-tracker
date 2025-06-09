
import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Calendar, PieChart, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseHistory from '@/components/ExpenseHistory';
import SavingsGoal from '@/components/SavingsGoal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ExpenseCalendar from '@/components/ExpenseCalendar';
import DarkModeToggle from '@/components/DarkModeToggle';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, SavingsGoalData } from '@/types/finance';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('budgetbloom-expenses', []);
  const [savingsGoal, setSavingsGoal] = useLocalStorage<SavingsGoalData | null>('budgetbloom-savings-goal', null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    setShowExpenseForm(false);
    toast({
      title: "Expense Added",
      description: `$${expense.amount} spent on ${expense.category}`,
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    toast({
      title: "Expense Deleted",
      description: "Your expense has been removed",
    });
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
            onSubmit={addExpense}
            onCancel={() => setShowExpenseForm(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
