import { useState } from 'react';
import { getMonthlySummary, getCategoryBreakdown, getGroupBreakdown, getDailySpending } from '../data/store';
import { formatMoney } from '../data/formatters';
import { MONTHS, EXPENSE_CATEGORIES } from '../data/constants';

function getCategoryName(id) {
  const cat = EXPENSE_CATEGORIES.find(c => c.id === id);
  return cat ? cat.name : id;
}

export default function Insights() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const summary = getMonthlySummary(year, month);
  const categoryData = getCategoryBreakdown(year, month);
  const groupData = getGroupBreakdown(year, month);
  const dailyData = getDailySpending(year, month);

  const prevMonthIdx = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const prevSummary = getMonthlySummary(prevMonthYear, prevMonthIdx);
  const prevCategoryData = getCategoryBreakdown(prevMonthYear, prevMonthIdx);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const avgDaily = summary.expenses > 0 ? summary.expenses / daysInMonth : 0;
  const maxDailySpend = dailyData.reduce((max, d) => Math.max(max, d.amount), 0);
  const highestDay = dailyData.find(d => d.amount === maxDailySpend);

  const expenseChange = prevSummary.expenses > 0
    ? ((summary.expenses - prevSummary.expenses) / prevSummary.expenses * 100).toFixed(0)
    : null;

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const topGrowth = categoryData
    .map(item => {
      const prev = prevCategoryData.find(p => p.category === item.category);
      const prevAmt = prev ? prev.amount : 0;
      const change = prevAmt > 0 ? ((item.amount - prevAmt) / prevAmt * 100) : null;
      return { ...item, prevAmt, change };
    })
    .filter(item => item.change !== null && item.change > 0)
    .sort((a, b) => b.change - a.change)
    .slice(0, 3);

  const maxBar = Math.max(...dailyData.map(d => d.amount), 1);

  return (
    <div className="insights">
      <header className="page-header">
        <h1>Spending Insights</h1>
        <div className="month-picker">
          <button onClick={prevMonth} className="month-arrow">&lt;</button>
          <span className="month-label">{MONTHS[month]} {year}</span>
          <button onClick={nextMonth} className="month-arrow">&gt;</button>
        </div>
      </header>

      {summary.count === 0 ? (
        <div className="empty-state">
          <p>No data for this month yet</p>
        </div>
      ) : (
        <>
          <div className="insight-cards">
            <div className="insight-card">
              <span className="insight-value">{formatMoney(avgDaily)}</span>
              <span className="insight-label">Avg. daily spend</span>
            </div>
            {highestDay && highestDay.amount > 0 && (
              <div className="insight-card">
                <span className="insight-value">{formatMoney(highestDay.amount)}</span>
                <span className="insight-label">Highest day (Day {highestDay.day})</span>
              </div>
            )}
            {expenseChange !== null && (
              <div className="insight-card">
                <span className={`insight-value ${Number(expenseChange) > 0 ? 'expense' : 'income'}`}>
                  {Number(expenseChange) > 0 ? '↑' : '↓'} {Math.abs(expenseChange)}%
                </span>
                <span className="insight-label">vs {MONTHS[prevMonthIdx]}</span>
              </div>
            )}
            <div className="insight-card">
              <span className="insight-value">{summary.count}</span>
              <span className="insight-label">Transactions</span>
            </div>
          </div>

          <section className="section">
            <h2>Daily Spending</h2>
            <div className="daily-chart">
              {dailyData.map(d => (
                <div key={d.day} className="bar-col">
                  <div
                    className="bar"
                    style={{ height: `${maxBar > 0 ? (d.amount / maxBar * 100) : 0}%` }}
                    title={`Day ${d.day}: ${formatMoney(d.amount)}`}
                  ></div>
                  {d.day % 5 === 1 && <span className="bar-label">{d.day}</span>}
                </div>
              ))}
            </div>
          </section>

          {groupData.length > 0 && (
            <section className="section">
              <h2>Spending by Group</h2>
              <div className="donut-breakdown">
                {groupData.map(item => {
                  const pct = (item.amount / summary.expenses * 100).toFixed(1);
                  return (
                    <div key={item.group} className="donut-row">
                      <div className="donut-info">
                        <span className="donut-name">{item.group}</span>
                        <span className="donut-pct">{pct}%</span>
                      </div>
                      <div className="donut-bar">
                        <div className="donut-fill" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="donut-amount">{formatMoney(item.amount)}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {topGrowth.length > 0 && (
            <section className="section">
              <h2>Biggest Increases vs {MONTHS[prevMonthIdx]}</h2>
              <div className="growth-list">
                {topGrowth.map(item => (
                  <div key={item.category} className="growth-row">
                    <span className="growth-name">{getCategoryName(item.category)}</span>
                    <div className="growth-amounts">
                      <span className="growth-prev">{formatMoney(item.prevAmt)}</span>
                      <span className="growth-arrow">→</span>
                      <span className="growth-curr">{formatMoney(item.amount)}</span>
                    </div>
                    <span className="growth-pct expense">+{item.change.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {summary.income > 0 && (
            <section className="section">
              <h2>Budget Health</h2>
              <div className="budget-health">
                <div className="health-bar">
                  <div
                    className={`health-fill ${summary.expenses / summary.income > 0.9 ? 'danger' : summary.expenses / summary.income > 0.7 ? 'warning' : 'good'}`}
                    style={{ width: `${Math.min(100, (summary.expenses / summary.income * 100))}%` }}
                  ></div>
                </div>
                <p className="health-text">
                  You've spent <strong>{(summary.expenses / summary.income * 100).toFixed(0)}%</strong> of your income this month.
                  {summary.balance > 0
                    ? ` You have ${formatMoney(summary.balance)} remaining.`
                    : ` You've overspent by ${formatMoney(Math.abs(summary.balance))}.`
                  }
                </p>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
