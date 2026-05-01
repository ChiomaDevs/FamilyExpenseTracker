import { useState } from 'react';
import { getMonthlySummary, getCategoryBreakdown, getGroupBreakdown, getMonthTransactions } from '../data/store';
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

const GROUP_COLORS = {
  Food: '#FF6B6B', Transport: '#4ECDC4', Housing: '#45B7D1',
  Personal: '#96CEB4', Subscriptions: '#FFEAA7', 'Church/Giving': '#DDA0DD',
  Family: '#98D8C8', Health: '#F7DC6F', Savings: '#82E0AA', Other: '#AEB6BF',
};

export default function MonthlyReport() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [view, setView] = useState('category');

  const summary = getMonthlySummary(year, month);
  const categoryData = getCategoryBreakdown(year, month);
  const groupData = getGroupBreakdown(year, month);
  const incomeTxns = getMonthTransactions(year, month).filter(t => t.type === 'income');

  const incomeByCategory = {};
  incomeTxns.forEach(t => {
    if (!incomeByCategory[t.category]) incomeByCategory[t.category] = 0;
    incomeByCategory[t.category] += t.amount;
  });
  const incomeBreakdown = Object.entries(incomeByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const displayData = view === 'category' ? categoryData : groupData;
  const maxAmount = displayData.length > 0 ? displayData[0].amount : 1;

  return (
    <div className="monthly-report">
      <header className="page-header">
        <h1>Monthly Report</h1>
        <div className="month-picker">
          <button onClick={prevMonth} className="month-arrow">&lt;</button>
          <span className="month-label">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="month-arrow">&gt;</button>
        </div>
      </header>

      <div className="report-summary">
        <div className="report-row">
          <span>Total Income</span>
          <span className="income">{formatMoney(summary.income)}</span>
        </div>
        <div className="report-row">
          <span>Total Expenses</span>
          <span className="expense">{formatMoney(summary.expenses)}</span>
        </div>
        <div className="report-row total">
          <span>Net Balance</span>
          <span className={summary.balance >= 0 ? 'income' : 'expense'}>
            {formatMoney(summary.balance)}
          </span>
        </div>
        {summary.income > 0 && (
          <div className="report-row">
            <span>Savings Rate</span>
            <span>{Math.round((summary.balance / summary.income) * 100)}%</span>
          </div>
        )}
      </div>

      {incomeBreakdown.length > 0 && (
        <section className="section">
          <h2>Income Breakdown</h2>
          <div className="breakdown-list">
            {incomeBreakdown.map(item => (
              <div key={item.category} className="breakdown-row">
                <span className="cat-icon">{getCategoryIcon(item.category)}</span>
                <div className="cat-info">
                  <span className="cat-name">{getCategoryName(item.category)}</span>
                </div>
                <span className="cat-amount income">{formatMoney(item.amount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-header">
          <h2>Expense Breakdown</h2>
          <div className="view-toggle">
            <button
              className={`toggle-sm ${view === 'category' ? 'active' : ''}`}
              onClick={() => setView('category')}
            >
              Category
            </button>
            <button
              className={`toggle-sm ${view === 'group' ? 'active' : ''}`}
              onClick={() => setView('group')}
            >
              Group
            </button>
          </div>
        </div>

        {displayData.length === 0 && (
          <p className="empty-text">No expenses this month</p>
        )}

        <div className="breakdown-list">
          {displayData.map(item => {
            const name = view === 'category' ? getCategoryName(item.category) : item.group;
            const icon = view === 'category' ? getCategoryIcon(item.category) : '';
            const pct = (item.amount / summary.expenses * 100).toFixed(1);
            const barPct = (item.amount / maxAmount * 100);
            const color = view === 'group' ? (GROUP_COLORS[item.group] || '#AEB6BF') : '#6C5CE7';

            return (
              <div key={name} className="breakdown-row">
                {icon && <span className="cat-icon">{icon}</span>}
                {!icon && <span className="cat-icon" style={{ background: color, width: 12, height: 12, borderRadius: '50%', display: 'inline-block' }}></span>}
                <div className="cat-info">
                  <div className="cat-name-row">
                    <span className="cat-name">{name}</span>
                    <span className="cat-pct">{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${barPct}%`, background: color }}></div>
                  </div>
                </div>
                <span className="cat-amount">{formatMoney(item.amount)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
