import type { Transaction, Budget, Asset, RecurringTransaction } from './types';

const KEY = 'kakeibo_v1';

export interface StoreData {
  transactions: Transaction[];
  budgets: Budget[];
  assets: Asset[];
  recurrings: RecurringTransaction[];
}

export const loadStore = (): StoreData => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoreData;
  } catch {
    // ignore corrupt data
  }
  return { transactions: [], budgets: [], assets: [], recurrings: [] };
};

export const saveStore = (data: StoreData): void => {
  localStorage.setItem(KEY, JSON.stringify(data));
};
