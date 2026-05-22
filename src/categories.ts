export const INCOME_CATEGORIES = ['給与', '副収入', '賞与', '投資収入', 'その他収入'] as const;

export const EXPENSE_CATEGORIES = [
  '食費', '外食費', '交通費', '光熱費', '通信費', '住居費',
  '医療費', '娯楽費', '衣服費', '日用品', '教育費', '保険', 'その他',
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  '食費': '#ef4444',
  '外食費': '#f97316',
  '交通費': '#f59e0b',
  '光熱費': '#84cc16',
  '通信費': '#22c55e',
  '住居費': '#06b6d4',
  '医療費': '#3b82f6',
  '娯楽費': '#8b5cf6',
  '衣服費': '#ec4899',
  '日用品': '#f43f5e',
  '教育費': '#14b8a6',
  '保険': '#6366f1',
  'その他': '#94a3b8',
};
