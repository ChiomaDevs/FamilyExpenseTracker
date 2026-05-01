import { useState } from 'react';
import { getMonthTransactions, deleteTransaction } from '../data/store';
import { formatMoney } from '../data/formatters';
import { MONTHS, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/constants';

function getCategoryName(id) {
  const cat = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.id === id);
  return cat ? cat.name : id;
}

function getCategoryIcon(id) {
  const cat = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.id === id);
  return cat ? cat.icon : '📝';
}

export default function TransactionList({ onChanged }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const txns = getMonthTransactions(year, month)
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleDelete = (id) => {
    deleteTransaction(id);
    setConfirmDelete(null);
    onChanged();
  };

  const grouped = {};
  txns.forEach(t => {
    const key = new Date(t.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <div className="transaction-list">
      <header className="page-header">
        <h1>Transaction History</h1>
        <div className="month-picker">
          <button onClick={prevMonth} className="month-arrow">&lt;</button>
          <span className="month-label">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="month-arrow">&gt;</button>
        </div>
      </header>

      <div className="filter-row">
        {['all', 'expense', 'income'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f === 'expense' ? 'Expenses' : 'Income'}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="empty-state">
          <p>No transactions found</p>
        </div>
      )}

      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel} className="date-group">
          <div className="date-label">{dateLabel}</div>
          {items.map(txn => (
            <div key={txn.id} className="txn-row">
              <span className="txn-icon">{getCategoryIcon(txn.category)}</span>
              <div className="txn-info">
                <span className="txn-name">{txn.description || getCategoryName(txn.category)}</span>
                <span className="txn-cat">{getCategoryName(txn.category)}</span>
              </div>
              <div className="txn-right">
                <span className={`txn-amount ${txn.type}`}>
                  {txn.type === 'income' ? '+' : '-'}{formatMoney(txn.amount)}
                </span>
                {confirmDelete === txn.id ? (
                  <div className="delete-confirm">
                    <button className="confirm-yes" onClick={() => handleDelete(txn.id)}>Delete</button>
                    <button className="confirm-no" onClick={() => setConfirmDelete(null)}>Cancel</button>
                  </div>
                ) : (
                  <button className="delete-btn" onClick={() => setConfirmDelete(txn.id)}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
