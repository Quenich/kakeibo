interface Props {
  monthKey: string;
  onChange: (monthKey: string) => void;
}

const toLabel = (mk: string) => {
  const [y, m] = mk.split('-');
  return `${y}年${parseInt(m)}月`;
};

const shift = (mk: string, delta: number): string => {
  const [y, m] = mk.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export function MonthPicker({ monthKey, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        onClick={() => onChange(shift(monthKey, -1))}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-xl"
        aria-label="前の月"
      >
        ‹
      </button>
      <span className="text-base font-semibold text-gray-800 w-32 text-center">
        {toLabel(monthKey)}
      </span>
      <button
        onClick={() => onChange(shift(monthKey, 1))}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors text-xl"
        aria-label="次の月"
      >
        ›
      </button>
    </div>
  );
}
