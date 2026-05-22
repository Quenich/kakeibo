import { useState, useCallback } from 'react';
import type { Transaction, Budget, Asset, RecurringTransaction } from '../types';
import { loadStore, saveStore, type StoreData } from '../storage';

// ── auto-apply recurring transactions on load ──────────────────────────────

const toDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const applyDueRecurrings = (data: StoreData): StoreData => {
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  let transactions = [...data.transactions];
  const recurrings = data.recurrings.map(rec => {
    if (!rec.active) return rec;

    const lastApplied = rec.lastApplied
      ? new Date(rec.lastApplied + 'T00:00:00')
      : null;

    const checkFrom = lastApplied
      ? new Date(lastApplied.getTime() + 86_400_000)
      : new Date(rec.startDate + 'T00:00:00');

    const dates: string[] = [];
    const freq = rec.frequency ?? 'weekly';

    if (freq === 'weekly') {
      const skip = (rec.dayOfWeek - checkFrom.getDay() + 7) % 7;
      let cur = new Date(checkFrom.getTime() + skip * 86_400_000);
      while (cur <= todayEnd) {
        dates.push(toDateStr(cur));
        cur = new Date(cur.getTime() + 7 * 86_400_000);
      }
    } else {
      let y = checkFrom.getFullYear();
      let m = checkFrom.getMonth();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const d = Math.min(rec.dayOfMonth, daysInMonth);
        const candidate = new Date(y, m, d);
        if (candidate >= checkFrom && candidate <= todayEnd) {
          dates.push(toDateStr(candidate));
        }
        if (m === 11) { y++; m = 0; } else { m++; }
        if (new Date(y, m, 1) > todayEnd) break;
      }
    }

    if (dates.length === 0) return rec;

    for (const date of dates) {
      transactions = [
        {
          id: crypto.randomUUID(),
          type: rec.type,
          category: rec.category,
          amount: rec.amount,
          description: rec.description,
          date,
          createdAt: new Date().toISOString(),
        },
        ...transactions,
      ];
    }

    return { ...rec, lastApplied: dates[dates.length - 1] };
  });

  return { ...data, transactions, recurrings };
};

// ── hook ──────────────────────────────────────────────────────────────────

type Store = StoreData;

export const useKakeibo = () => {
  const [store, setStore] = useState<Store>(() => {
    const raw = loadStore();
    const initialised: Store = {
      transactions: raw.transactions ?? [],
      budgets: raw.budgets ?? [],
      assets: raw.assets ?? [],
      recurrings: raw.recurrings ?? [],
    };
    const applied = applyDueRecurrings(initialised);
    saveStore(applied);
    return applied;
  });

  const update = useCallback((fn: (s: Store) => Store) => {
    setStore(prev => {
      const next = fn(prev);
      saveStore(next);
      return next;
    });
  }, []);

  // ── transactions ────────────────────────────────────────────────────────

  const addTransaction = useCallback(
    (tx: Omit<Transaction, 'id' | 'createdAt'>) =>
      update(s => ({
        ...s,
        transactions: [
          { ...tx, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ...s.transactions,
        ],
      })),
    [update]
  );

  const updateTransaction = useCallback(
    (id: string, tx: Omit<Transaction, 'id' | 'createdAt'>) =>
      update(s => ({
        ...s,
        transactions: s.transactions.map(t => t.id === id ? { ...t, ...tx } : t),
      })),
    [update]
  );

  const deleteTransaction = useCallback(
    (id: string) =>
      update(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) })),
    [update]
  );

  // ── budgets ─────────────────────────────────────────────────────────────

  const setBudget = useCallback(
    (category: string, amount: number) =>
      update(s => {
        const exists = s.budgets.find(b => b.category === category);
        return {
          ...s,
          budgets: exists
            ? s.budgets.map(b => b.category === category ? { ...b, amount } : b)
            : [...s.budgets, { category, amount }],
        };
      }),
    [update]
  );

  // ── assets ──────────────────────────────────────────────────────────────

  const addAsset = useCallback(
    (label: string, amount: number) =>
      update(s => ({
        ...s,
        assets: [...s.assets, { id: crypto.randomUUID(), label, amount }],
      })),
    [update]
  );

  const updateAsset = useCallback(
    (id: string, label: string, amount: number) =>
      update(s => ({
        ...s,
        assets: s.assets.map(a => a.id === id ? { ...a, label, amount } : a),
      })),
    [update]
  );

  const deleteAsset = useCallback(
    (id: string) =>
      update(s => ({ ...s, assets: s.assets.filter(a => a.id !== id) })),
    [update]
  );

  // ── recurring ───────────────────────────────────────────────────────────

  const addRecurring = useCallback(
    (rec: Omit<RecurringTransaction, 'id' | 'lastApplied'>) =>
      update(s => ({
        ...s,
        recurrings: [
          ...s.recurrings,
          { ...rec, id: crypto.randomUUID(), lastApplied: null },
        ],
      })),
    [update]
  );

  const updateRecurring = useCallback(
    (id: string, rec: Omit<RecurringTransaction, 'id' | 'lastApplied'>) =>
      update(s => ({
        ...s,
        recurrings: s.recurrings.map(r =>
          r.id === id ? { ...r, ...rec } : r
        ),
      })),
    [update]
  );

  const toggleRecurring = useCallback(
    (id: string) =>
      update(s => ({
        ...s,
        recurrings: s.recurrings.map(r =>
          r.id === id ? { ...r, active: !r.active } : r
        ),
      })),
    [update]
  );

  const deleteRecurring = useCallback(
    (id: string) =>
      update(s => ({ ...s, recurrings: s.recurrings.filter(r => r.id !== id) })),
    [update]
  );

  return {
    transactions: store.transactions,
    budgets: store.budgets,
    assets: store.assets,
    recurrings: store.recurrings,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setBudget,
    addAsset,
    updateAsset,
    deleteAsset,
    addRecurring,
    updateRecurring,
    toggleRecurring,
    deleteRecurring,
  };
};
