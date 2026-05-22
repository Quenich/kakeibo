import type { Budget } from '../types';
import { CATEGORY_COLORS } from '../categories';

interface Props {
  title: string;
  budgets: Budget[];
  actualByCategory: Record<string, number>;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export function BudgetProgress({ title, budgets, actualByCategory }: Props) {
  const items = budgets.filter(b => b.amount > 0);
  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">{title}</h2>
      <div className="space-y-4">
        {items.map(b => {
          const actual = actualByCategory[b.category] ?? 0;
          const pct = Math.min((actual / b.amount) * 100, 100);
          const over = actual > b.amount;
          const color = CATEGORY_COLORS[b.category] ?? '#94a3b8';

          return (
            <div key={b.category}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-gray-700">{b.category}</span>
                <span className={over ? 'text-red-500 font-semibold' : 'text-gray-400'}>
                  {fmt(actual)} / {fmt(b.amount)}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : color }}
                />
              </div>
              {over && (
                <div className="text-xs text-red-500 mt-0.5">
                  予算超過 {fmt(actual - b.amount)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
