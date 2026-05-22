import { useMemo } from 'react';
import type { Transaction, Budget, Asset } from '../types';
import { EXPENSE_CATEGORIES } from '../categories';
import { MonthPicker } from '../components/MonthPicker';
import { SummaryCards } from '../components/SummaryCards';
import { CategoryPieChart } from '../components/CategoryPieChart';
import { BudgetProgress } from '../components/BudgetProgress';

interface Props {
  transactions: Transaction[];
  budgets: Budget[];
  assets: Asset[];
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2 });

export function DashboardPage({ transactions, budgets, assets, currentMonth, onMonthChange }: Props) {
  const data = useMemo(() => {
    const monthly = transactions.filter(t => t.date.startsWith(currentMonth));
    const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const expenseByCategory: Record<string, number> = {};
    for (const cat of EXPENSE_CATEGORIES) {
      const total = monthly
        .filter(t => t.type === 'expense' && t.category === cat)
        .reduce((s, t) => s + t.amount, 0);
      if (total > 0) expenseByCategory[cat] = total;
    }

    const allTimeNet = transactions.reduce(
      (s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0
    );

    return { income, expense, balance: income - expense, expenseByCategory, allTimeNet };
  }, [transactions, currentMonth]);

  const totalAssets = assets.reduce((s, a) => s + a.amount, 0);
  const currentBalance = totalAssets + data.allTimeNet;
  const savingsRate = data.income > 0
    ? Math.round((data.balance / data.income) * 100)
    : null;

  return (
    <div className="py-4 space-y-4">
      <MonthPicker monthKey={currentMonth} onChange={onMonthChange} />

      {totalAssets > 0 && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-xs opacity-60 mb-1">現在残高</div>
          <div className="text-3xl font-bold tracking-tight">{fmt(currentBalance)}</div>
          <div className="flex items-center gap-3 mt-2 text-xs opacity-70">
            <span>繰越 {fmt(totalAssets)}</span>
            {data.allTimeNet !== 0 && (
              <span className={data.allTimeNet >= 0 ? 'text-green-300' : 'text-red-300'}>
                {data.allTimeNet >= 0 ? '+' : '-'}{fmt(Math.abs(data.allTimeNet))}
              </span>
            )}
          </div>
        </div>
      )}

      <SummaryCards
        income={data.income}
        expense={data.expense}
        balance={data.balance}
      />

      {savingsRate !== null && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-xs opacity-75 mb-1">貯蓄率</div>
          <div className="text-3xl font-bold">{savingsRate}%</div>
          <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
            />
          </div>
        </div>
      )}

      <CategoryPieChart data={data.expenseByCategory} />

      <BudgetProgress
        title="支出予算"
        budgets={budgets}
        actualByCategory={data.expenseByCategory}
      />

      {data.income === 0 && data.expense === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">
          「収支」タブから記録を追加してください
        </div>
      )}
    </div>
  );
}
