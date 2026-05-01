import { useState } from 'react';
import { getMonthlySummary, getMonthTransactions, getCategoryBreakdown } from '../data/store';
import { formatMoney, getMonthYear } from '../data/formatters';
import { MONTHS } from '../data/constants';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/constants';

function getCategoryName(id) {
  const cat = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.id === id);
  return cat ? cat.name : id;
}

function getCategoryIcon(id) {
  const cat = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.id === id);
  return cat ? cat.icon : '📝';
}

export default function Dashboard({ onNavigate }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const summary = getMonthlySummary(year, month);
  const topExpenses = getCategoryBreakdown(year, month).slice(0, 5);
  const recentTxns = getMonthTransactions(year, month)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>My Expenses</h1>
        <div className="month-picker">
          <button onClick={prevMonth} className="month-arrow">&lt;</button>
          <span className="month-label">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="month-arrow">&gt;</button>
        </div>
      </header>

      <div className="summary-cards">
        <div className="summary-card income-card">
          <span className="card-label">Income</span>
          <span className="card-amount">{formatMoney(summary.income)}</span>
        </div>
        <div className="summary-card expense-card">
          <span className="card-label">Expenses</span>
          <span className="card-amount">{formatMoney(summary.expenses)}</span>
        </div>
        <div className={`summary-card balance-card ${summary.balance >= 0 ? 'positive' : 'negative'}`}>
          <span className="card-label">Balance</span>
          <span className="card-amount">{formatMoney(summary.balance)}</span>
        </div>
      </div>

      {topExpenses.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Top Expenses</h2>
            <button className="link-btn" onClick={() => onNavigate('report')}>See all</button>
          </div>
          <div className="category-list">
            {topExpenses.map(item => {
              const pct = summary.expenses > 0 ? (item.amount / summary.expenses * 100) : 0;
              return (
                <div key={item.category} className="category-row">
                  <span className="cat-icon">{getCategoryIcon(item.category)}</span>
                  <div className="cat-info">
                    <span className="cat-name">{getCategoryName(item.category)}</span>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <span className="cat-amount">{formatMoney(item.amount)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {recentTxns.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Recent Transactions</h2>
            <button className="link-btn" onClick={() => onNavigate('transactions')}>See all</button>
          </div>
          <div className="txn-list">
            {recentTxns.map(txn => (
              <div key={txn.id} className="txn-row">
                <span className="txn-icon">{getCategoryIcon(txn.category)}</span>
                <div className="txn-info">
                  <span className="txn-name">{txn.description || getCategoryName(txn.category)}</span>
                  <span className="txn-date">{new Date(txn.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                </div>
                <span className={`txn-amount ${txn.type}`}>
                  {txn.type === 'income' ? '+' : '-'}{formatMoney(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {summary.count === 0 && (
        <div className="empty-state">
          <p className="empty-icon">📝</p>
          <p>No transactions for {MONTHS[month]}</p>
          <button className="primary-btn" onClick={() => onNavigate('add')}>Add your first transaction</button>
        </div>
      )}
    </div>
  );
}
