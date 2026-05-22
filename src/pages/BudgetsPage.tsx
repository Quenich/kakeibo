import { useState } from 'react';
import type { Asset } from '../types';

interface Props {
  assets: Asset[];
  addAsset: (label: string, amount: number) => void;
  updateAsset: (id: string, label: string, amount: number) => void;
  deleteAsset: (id: string) => void;
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export function BudgetsPage({ assets, addAsset, updateAsset, deleteAsset }: Props) {
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const total = assets.reduce((s, a) => s + a.amount, 0);

  const handleAdd = () => {
    const n = Math.round(parseFloat(newAmount) * 100) / 100;
    if (!newLabel.trim() || isNaN(n) || n < 0) return;
    addAsset(newLabel.trim(), n);
    setNewLabel('');
    setNewAmount('');
  };

  const startEdit = (a: Asset) => {
    setEditingId(a.id);
    setEditLabel(a.label);
    setEditAmount(a.amount.toString());
  };

  const commitEdit = (id: string) => {
    const n = Math.round(parseFloat(editAmount) * 100) / 100;
    if (editLabel.trim() && !isNaN(n) && n >= 0) {
      updateAsset(id, editLabel.trim(), n);
    }
    setEditingId(null);
  };

  return (
    <div className="py-4 space-y-4">
      <p className="text-sm text-gray-400 px-1">
        現在の所持金・口座残高を登録します。
      </p>

      {/* Asset list */}
      {assets.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {assets.map(a => (
            <div key={a.id} className="px-4 py-3">
              {editingId === a.id ? (
                <div className="flex gap-2 items-center">
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editAmount}
                      onChange={e => setEditAmount(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && commitEdit(a.id)}
                      className="w-32 border border-gray-200 rounded-xl pl-7 pr-3 py-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                    />
                  </div>
                  <button
                    onClick={() => commitEdit(a.id)}
                    className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 bg-gray-100 text-gray-500 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex-1 text-sm font-medium text-gray-800">{a.label}</span>
                  <span className="text-sm font-bold text-gray-900">{fmt(a.amount)}</span>
                  <button
                    onClick={() => startEdit(a)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                    aria-label="編集"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteAsset(a.id)}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                    aria-label="削除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {assets.length > 0 && (
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-4 text-white shadow-sm">
          <div className="text-xs opacity-60 mb-1">所持金合計</div>
          <div className="text-3xl font-bold tracking-tight">{fmt(total)}</div>
        </div>
      )}

      {/* Add new */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">追加</h3>
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="名前（例: 現金、銀行口座）"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
        />
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={newAmount}
            onChange={e => setNewAmount(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="0"
            className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!newLabel.trim() || !newAmount}
          className="w-full py-2.5 bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors"
        >
          追加する
        </button>
      </div>
    </div>
  );
}
