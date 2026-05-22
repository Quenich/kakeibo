import { useState } from 'react';
import { useKakeibo } from './hooks/useKakeibo';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { RecurringPage } from './pages/RecurringPage';
import { BudgetsPage } from './pages/BudgetsPage';

type Tab = 'dashboard' | 'transactions' | 'recurring' | 'assets';

const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const RepeatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const WalletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
  </svg>
);

const TABS: { id: Tab; label: string; Icon: () => JSX.Element }[] = [
  { id: 'dashboard',    label: 'ホーム', Icon: HomeIcon },
  { id: 'transactions', label: '収支',   Icon: ListIcon },
  { id: 'recurring',   label: '定期',   Icon: RepeatIcon },
  { id: 'assets',      label: '所持金', Icon: WalletIcon },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [month, setMonth] = useState(currentMonthKey);
  const store = useKakeibo();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">家計簿</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-24">
        {tab === 'dashboard' && (
          <DashboardPage
            transactions={store.transactions}
            budgets={store.budgets}
            assets={store.assets}
            currentMonth={month}
            onMonthChange={setMonth}
          />
        )}
        {tab === 'transactions' && (
          <TransactionsPage
            transactions={store.transactions}
            addTransaction={store.addTransaction}
            updateTransaction={store.updateTransaction}
            deleteTransaction={store.deleteTransaction}
            currentMonth={month}
            onMonthChange={setMonth}
          />
        )}
        {tab === 'recurring' && (
          <RecurringPage
            recurrings={store.recurrings}
            addRecurring={store.addRecurring}
            updateRecurring={store.updateRecurring}
            toggleRecurring={store.toggleRecurring}
            deleteRecurring={store.deleteRecurring}
          />
        )}
        {tab === 'assets' && (
          <BudgetsPage
            assets={store.assets}
            addAsset={store.addAsset}
            updateAsset={store.updateAsset}
            deleteAsset={store.deleteAsset}
          />
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-100">
        <div className="max-w-2xl mx-auto grid grid-cols-4">
          {TABS.map(({ id, label, Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                  active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
