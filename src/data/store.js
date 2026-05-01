const STORAGE_KEY = 'expense_tracker_data';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { transactions: [] };
  } catch {
    return { transactions: [] };
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTransactions() {
  return loadData().transactions;
}

export function addTransaction(transaction) {
  const data = loadData();
  data.transactions.push({
    ...transaction,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  saveData(data);
  return data.transactions;
}

export function deleteTransaction(id) {
  const data = loadData();
  data.transactions = data.transactions.filter(t => t.id !== id);
  saveData(data);
  return data.transactions;
}

export function editTransaction(id, updates) {
  const data = loadData();
  const idx = data.transactions.findIndex(t => t.id === id);
  if (idx !== -1) {
    data.transactions[idx] = { ...data.transactions[idx], ...updates };
  }
  saveData(data);
  return data.transactions;
}

export function getMonthTransactions(year, month) {
  return getTransactions().filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

export function getMonthlySummary(year, month) {
  const txns = getMonthTransactions(year, month);
  const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return { income, expenses, balance: income - expenses, count: txns.length };
}

export function getCategoryBreakdown(year, month) {
  const txns = getMonthTransactions(year, month).filter(t => t.type === 'expense');
  const map = {};
  txns.forEach(t => {
    if (!map[t.category]) map[t.category] = 0;
    map[t.category] += t.amount;
  });
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getGroupBreakdown(year, month) {
  const txns = getMonthTransactions(year, month).filter(t => t.type === 'expense');
  const map = {};
  txns.forEach(t => {
    const group = t.group || 'Other';
    if (!map[group]) map[group] = 0;
    map[group] += t.amount;
  });
  return Object.entries(map)
    .map(([group, amount]) => ({ group, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getDailySpending(year, month) {
  const txns = getMonthTransactions(year, month).filter(t => t.type === 'expense');
  const map = {};
  txns.forEach(t => {
    const day = new Date(t.date).getDate();
    if (!map[day]) map[day] = 0;
    map[day] += t.amount;
  });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: map[i + 1] || 0,
  }));
}

export function exportData() {
  return JSON.stringify(loadData(), null, 2);
}

export function importData(jsonString) {
  const data = JSON.parse(jsonString);
  if (data.transactions && Array.isArray(data.transactions)) {
    saveData(data);
    return true;
  }
  throw new Error('Invalid data format');
}
