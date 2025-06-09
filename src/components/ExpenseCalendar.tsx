
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Expense } from '@/types/finance';

interface ExpenseCalendarProps {
  expenses: Expense[];
}

const ExpenseCalendar: React.FC<ExpenseCalendarProps> = ({ expenses }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getDayExpenses = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return expenses.filter(expense => expense.date === dateStr);
  };

  const getDayTotal = (day: number) => {
    const dayExpenses = getDayExpenses(day);
    return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const selectedDateExpenses = selectedDate ? expenses.filter(expense => expense.date === selectedDate) : [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Expense Calendar</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {monthNames[month]} {year}
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map(day => (
              <div key={day} className="text-center font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDayWeekday }, (_, i) => (
              <div key={`empty-${i}`} className="h-16" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayTotal = getDayTotal(day);
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasExpenses = dayTotal > 0;
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

              return (
                <div
                  key={day}
                  className={`h-16 p-1 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    isToday ? 'ring-2 ring-emerald-500' : ''
                  } ${hasExpenses ? 'bg-emerald-50 dark:bg-emerald-950' : 'hover:bg-muted'}`}
                  onClick={() => hasExpenses && setSelectedDate(dateStr)}
                >
                  <div className="text-sm font-medium">{day}</div>
                  {hasExpenses && (
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      ${dayTotal.toFixed(0)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Click on a day with expenses to see details
          </div>
        </CardContent>
      </Card>

      {/* Day Detail Dialog */}
      <Dialog open={selectedDate !== null} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Expenses for {selectedDate && new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDateExpenses.map((expense) => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">{expense.category}</div>
                  {expense.description && (
                    <div className="text-sm text-muted-foreground">{expense.description}</div>
                  )}
                </div>
                <div className="font-semibold">${expense.amount.toFixed(2)}</div>
              </div>
            ))}
            <div className="border-t pt-3 flex justify-between items-center font-semibold">
              <span>Total</span>
              <span>${selectedDateExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseCalendar;
