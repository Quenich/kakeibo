import { useState, useRef } from 'react';
import type { Transaction } from '../types';
import { CATEGORY_COLORS } from '../categories';

interface Props {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

const groupByDate = (txs: Transaction[]): [string, Transaction[]][] => {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const list = map.get(tx.date) ?? [];
    list.push(tx);
    map.set(tx.date, list);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
};

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('ja-JP', {
    month: 'long', day: 'numeric', weekday: 'short',
  }).format(new Date(s + 'T00:00:00'));

export function TransactionList({ transactions, onEdit, onDelete }: Props) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleteClick = (id: string) => {
    if (pendingDelete === id) {
      if (timerRef.current) clearTimeout(timerRef.current);
      onDelete(id);
      setPendingDelete(null);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      setPendingDelete(id);
      timerRef.current = setTimeout(() => setPendingDelete(null), 3000);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">まだ記録がありません</p>
      </div>
    );
  }

  const groups = groupByDate(transactions);

  return (
    <div className="space-y-5">
      {groups.map(([date, txs]) => {
        const dayTotal = txs.reduce(
          (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0
        );
        return (
          <div key={date}>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {formatDate(date)}
              </span>
              <span className={`text-xs font-semibold ${dayTotal >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                {dayTotal >= 0 ? '+' : '-'}{fmt(Math.abs(dayTotal))}
              </span>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {txs.map(tx => (
                <div key={tx.id} className="flex items-center px-4 py-3 gap-3 group">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[tx.category] ?? '#94a3b8' }}
                  >
                    {tx.category[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-800">{tx.category}</div>
                    {tx.description && (
                      <div className="text-xs text-gray-400 truncate">{tx.description}</div>
                    )}
                  </div>

                  <div className={`text-sm font-bold flex-shrink-0 ${tx.type === 'income' ? 'text-green-600' : 'text-gray-800'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </div>

                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-500 transition-colors"
                      aria-label="編集"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(tx.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        pendingDelete === tx.id
                          ? 'bg-red-50 text-red-500'
                          : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
                      }`}
                      aria-label={pendingDelete === tx.id ? '削除を確認' : '削除'}
                      title={pendingDelete === tx.id ? 'もう一度押すと削除' : '削除'}
                    >
                      {pendingDelete === tx.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
