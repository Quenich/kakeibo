import { useState } from 'react';
import type { Transaction } from '../types';
import { MonthPicker } from '../components/MonthPicker';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';

interface Props {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

export function TransactionsPage({
  transactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  currentMonth,
  onMonthChange,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const monthTxs = transactions.filter(t => t.date.startsWith(currentMonth));

  const handleSubmit = (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editing) {
      updateTransaction(editing.id, tx);
    } else {
      addTransaction(tx);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (tx: Transaction) => {
    setEditing(tx);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center">
        <div className="flex-1">
          <MonthPicker monthKey={currentMonth} onChange={onMonthChange} />
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white text-2xl leading-none shadow-md hover:bg-blue-700 active:bg-blue-800 transition-colors flex-shrink-0"
          aria-label="収支を追加"
        >
          +
        </button>
      </div>

      <TransactionList
        transactions={monthTxs}
        onEdit={handleEdit}
        onDelete={deleteTransaction}
      />

      {showForm && (
        <TransactionForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
