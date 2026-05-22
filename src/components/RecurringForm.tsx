import { useState, type FormEvent } from 'react';
import type { RecurringTransaction, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../categories';

interface Props {
  initial?: RecurringTransaction;
  onSubmit: (rec: Omit<RecurringTransaction, 'id' | 'lastApplied'>) => void;
  onClose: () => void;
}

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];
const today = () => new Date().toISOString().slice(0, 10);

export function RecurringForm({ initial, onSubmit, onClose }: Props) {
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>(
    initial?.frequency ?? 'weekly'
  );
  const [dayOfWeek, setDayOfWeek] = useState(initial?.dayOfWeek ?? 1);
  const [dayOfMonth, setDayOfMonth] = useState(initial?.dayOfMonth ?? 1);
  const [category, setCategory] = useState(
    initial?.category ?? EXPENSE_CATEGORIES[0]
  );
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [startDate, setStartDate] = useState(initial?.startDate ?? today());
  const [active] = useState(initial?.active ?? true);

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    setCategory(t === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const amt = Math.round(parseFloat(amount) * 100) / 100;
    if (isNaN(amt) || amt <= 0) return;
    onSubmit({ type, frequency, dayOfWeek, dayOfMonth, category, amount: amt, description, startDate, active });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-w-2xl p-6 pb-8 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? '定期を編集' : '定期を追加'}
          </h2>
          <button type="button" onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 p-1 gap-1 bg-gray-50">
            {(['expense', 'income'] as const).map(t => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  type === t
                    ? t === 'expense' ? 'bg-red-500 text-white shadow-sm' : 'bg-green-500 text-white shadow-sm'
                    : 'text-gray-500'
                }`}>
                {t === 'expense' ? '支出' : '収入'}
              </button>
            ))}
          </div>

          {/* Frequency toggle */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 p-1 gap-1 bg-gray-50">
            {(['weekly', 'monthly'] as const).map(f => (
              <button key={f} type="button" onClick={() => setFrequency(f)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  frequency === f ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'
                }`}>
                {f === 'weekly' ? '毎週' : '毎月'}
              </button>
            ))}
          </div>

          {/* Weekly: day of week */}
          {frequency === 'weekly' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">繰り返す曜日</label>
              <div className="flex gap-1.5">
                {DAYS.map((d, i) => (
                  <button key={i} type="button" onClick={() => setDayOfWeek(i)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      dayOfWeek === i
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: day of month */}
          {frequency === 'monthly' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">繰り返す日</label>
              <select
                value={dayOfMonth}
                onChange={e => setDayOfMonth(parseInt(e.target.value, 10))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>毎月 {d} 日</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">カテゴリ</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" required>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">開始日</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" required />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">金額</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
              <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
                placeholder="0"
                step="0.01"
                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 text-right text-lg font-semibold"
                required />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">メモ（任意）</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="メモを入力..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50" />
          </div>

          <button type="submit"
            className={`w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-colors shadow-sm ${
              type === 'expense' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}>
            {initial ? '更新する' : '追加する'}
          </button>
        </form>
      </div>
    </div>
  );
}
