const fmt = (n: number) => '$' + Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 2 });

interface Props {
  income: number;
  expense: number;
  balance: number;
}

export function SummaryCards({ income, expense, balance }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-xs text-gray-400 mb-1">収入</div>
        <div className="text-base font-bold text-green-600 truncate">{fmt(income)}</div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-xs text-gray-400 mb-1">支出</div>
        <div className="text-base font-bold text-red-500 truncate">{fmt(expense)}</div>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-xs text-gray-400 mb-1">収支</div>
        <div className={`text-base font-bold truncate ${balance >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
          {balance >= 0 ? '+' : '-'}{fmt(balance)}
        </div>
      </div>
    </div>
  );
}
