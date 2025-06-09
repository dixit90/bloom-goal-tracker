
import React, { useState } from 'react';
import { Target, Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SavingsGoalData } from '@/types/finance';

interface SavingsGoalProps {
  currentGoal: SavingsGoalData | null;
  totalSpent: number;
  onUpdateGoal: (goal: SavingsGoalData) => void;
}

const SavingsGoal: React.FC<SavingsGoalProps> = ({ currentGoal, totalSpent, onUpdateGoal }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [goalAmount, setGoalAmount] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const isCurrentMonth = currentGoal?.month === currentMonth;
  const savedAmount = isCurrentMonth ? Math.max(0, (currentGoal?.amount || 0) - totalSpent) : 0;
  const progressPercentage = isCurrentMonth && currentGoal ? Math.min(100, (savedAmount / currentGoal.amount) * 100) : 0;
  const isOverBudget = isCurrentMonth && currentGoal && totalSpent > currentGoal.amount;

  const handleSaveGoal = () => {
    const amount = parseFloat(goalAmount);
    if (amount > 0) {
      onUpdateGoal({
        amount,
        month: currentMonth,
      });
      setIsEditing(false);
      setGoalAmount('');
    }
  };

  const handleEditGoal = () => {
    setGoalAmount(currentGoal?.amount.toString() || '');
    setIsEditing(true);
  };

  const getNudgeMessage = () => {
    if (!isCurrentMonth || !currentGoal) return null;

    if (isOverBudget) {
      return {
        message: "You've exceeded your spending limit! Consider a no-spend day tomorrow.",
        type: 'warning'
      };
    }

    if (progressPercentage >= 75) {
      return {
        message: "Amazing! You're almost reaching your savings goal! 🎉",
        type: 'success'
      };
    }

    if (progressPercentage >= 50) {
      return {
        message: "Great progress! You're halfway to your savings goal!",
        type: 'info'
      };
    }

    if (progressPercentage >= 25) {
      return {
        message: "Good start! Keep tracking your expenses to reach your goal.",
        type: 'info'
      };
    }

    return {
      message: "Start strong! Every dollar saved brings you closer to your goal.",
      type: 'info'
    };
  };

  const nudge = getNudgeMessage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-500" />
            Monthly Savings Goal
          </div>
          {!isEditing && (
            <Button variant="ghost" size="icon" onClick={handleEditGoal}>
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentGoal || !isCurrentMonth ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-semibold mb-2">Set Your Monthly Goal</h3>
            <p className="text-muted-foreground mb-4">
              How much do you want to save this month?
            </p>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-emerald-500 hover:bg-emerald-600">
                Set Goal
              </Button>
            ) : (
              <div className="flex gap-2 max-w-xs mx-auto">
                <Input
                  type="number"
                  placeholder="Goal amount"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                />
                <Button onClick={handleSaveGoal} size="icon">
                  <Check className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ) : isEditing ? (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Goal amount"
              value={goalAmount}
              onChange={(e) => setGoalAmount(e.target.value)}
            />
            <Button onClick={handleSaveGoal} size="icon">
              <Check className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Goal: ${currentGoal.amount.toFixed(2)}</span>
              <span>Spent: ${totalSpent.toFixed(2)}</span>
            </div>
            
            <Progress 
              value={isOverBudget ? 100 : progressPercentage} 
              className={`h-3 ${isOverBudget ? 'bg-red-100' : ''}`}
            />
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                ${Math.abs(savedAmount).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                {isOverBudget ? 'Over budget' : 'Available to save'}
              </p>
            </div>

            {nudge && (
              <div className={`p-3 rounded-lg text-sm ${
                nudge.type === 'warning' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-200' :
                nudge.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-200' :
                'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200'
              }`}>
                {nudge.message}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsGoal;
