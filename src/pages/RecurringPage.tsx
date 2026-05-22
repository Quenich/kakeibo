import { useState, useRef } from 'react';
import type { RecurringTransaction } from '../types';
import { CATEGORY_COLORS } from '../categories';
import { RecurringForm } from '../components/RecurringForm';

interface Props {
  recurrings: RecurringTransaction[];
  addRecurring: (rec: Omit<RecurringTransaction, 'id' | 'lastApplied'>) => void;
  updateRecurring: (id: string, rec: Omit<RecurringTransaction, 'id' | 'lastApplied'>) => void;
  toggleRecurring: (id: string) => void;
  deleteRecurring: (id: string) => void;
}

const DAYS = ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜'];

const freqLabel = (rec: RecurringTransaction) =>
  rec.frequency === 'monthly'
    ? `毎月 ${rec.dayOfMonth} 日`
    : `毎週${DAYS[rec.dayOfWeek]}`;
const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export function RecurringPage({
  recurrings,
  addRecurring,
  updateRecurring,
  toggleRecurring,
  deleteRecurring,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSubmit = (rec: Omit<RecurringTransaction, 'id' | 'lastApplied'>) => {
    if (editing) {
      updateRecurring(editing.id, rec);
    } else {
      addRecurring(rec);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (rec: RecurringTransaction) => {
    setEditing(rec);
    setShowForm(true);
  };

  const handleDeleteClick = (id: string) => {
    if (pendingDelete === id) {
      if (timerRef.current) clearTimeout(timerRef.current);
      deleteRecurring(id);
      setPendingDelete(null);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPendingDelete(id);
      timerRef.current = setTimeout(() => setPendingDelete(null), 3000);
    }
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-400">毎週自動で収支が記録されます。</p>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl leading-none shadow-md hover:bg-blue-700 transition-colors flex-shrink-0"
          aria-label="定期を追加"
        >
          +
        </button>
      </div>

      {recurrings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-sm">定期登録がありません</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {recurrings.map(rec => (
            <div
              key={rec.id}
              className={`flex items-center px-4 py-3 gap-3 transition-opacity ${rec.active ? '' : 'opacity-40'}`}
            >
              {/* Frequency badge */}
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                style={{ backgroundColor: CATEGORY_COLORS[rec.category] ?? '#94a3b8' }}
              >
                {rec.frequency === 'monthly'
                  ? `${rec.dayOfMonth}日`
                  : DAYS[rec.dayOfWeek].slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                    rec.type === 'income'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {rec.type === 'income' ? '収入' : '支出'}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{rec.category}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {freqLabel(rec)}
                  {rec.description ? ` · ${rec.description}` : ''}
                </div>
              </div>

              {/* Amount */}
              <div className={`text-sm font-bold flex-shrink-0 ${rec.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                {fmt(rec.amount)}
              </div>

              {/* Active toggle */}
              <button
                onClick={() => toggleRecurring(rec.id)}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  rec.active
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
                aria-label={rec.active ? '無効にする' : '有効にする'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Edit */}
              <button
                onClick={() => handleEdit(rec)}
                className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors flex-shrink-0"
                aria-label="編集"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                  <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                </svg>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDeleteClick(rec.id)}
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  pendingDelete === rec.id
                    ? 'bg-red-50 text-red-500'
                    : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                }`}
                aria-label={pendingDelete === rec.id ? '削除を確認' : '削除'}
                title={pendingDelete === rec.id ? 'もう一度押すと削除' : '削除'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <RecurringForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
