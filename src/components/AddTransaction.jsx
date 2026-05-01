import { useState } from 'react';
import { addTransaction } from '../data/store';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_GROUPS } from '../data/constants';

export default function AddTransaction({ onSaved }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedAmount, setSavedAmount] = useState(0);
  const [savedType, setSavedType] = useState('expense');

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCat = categories.find(c => c.id === category);

  const groupedCategories = type === 'expense'
    ? CATEGORY_GROUPS.map(group => ({
        group,
        items: EXPENSE_CATEGORIES.filter(c => c.group === group),
      })).filter(g => g.items.length > 0)
    : [{ group: 'Income', items: INCOME_CATEGORIES }];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !category) return;

    addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      group: selectedCat?.group || '',
      description: description.trim(),
      date,
    });

    setSavedAmount(parseFloat(amount));
    setSavedType(type);
    setShowSuccess(true);
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleAddAnother = () => {
    setShowSuccess(false);
  };

  const handleGoHome = () => {
    onSaved();
  };

  if (showSuccess) {
    return (
      <div className="add-transaction">
        <div className="success-message">
          <span className="success-icon">✅</span>
          <h2>Transaction Saved!</h2>
          <p className="success-detail">
            {savedType === 'income' ? 'Income' : 'Expense'} of ₦{savedAmount.toLocaleString('en-NG')} recorded
          </p>
          <div className="success-actions">
            <button className="primary-btn" onClick={handleAddAnother}>Add Another</button>
            <button className="secondary-btn" onClick={handleGoHome}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-transaction">
      <header className="page-header">
        <h1>Add Transaction</h1>
      </header>

      <form onSubmit={handleSubmit} className="txn-form">
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
            onClick={() => { setType('expense'); setCategory(''); }}
          >
            Expense
          </button>
          <button
            type="button"
            className={`toggle-btn ${type === 'income' ? 'active income' : ''}`}
            onClick={() => { setType('income'); setCategory(''); }}
          >
            Income
          </button>
        </div>

        <div className="form-group">
          <label>Amount (₦)</label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="amount-input"
            required
            min="1"
          />
        </div>

        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="date-input"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <div className="category-grid">
            {groupedCategories.map(({ group, items }) => (
              <div key={group} className="cat-group">
                <span className="cat-group-label">{group}</span>
                <div className="cat-chips">
                  {items.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-chip ${category === cat.id ? 'selected' : ''}`}
                      onClick={() => setCategory(cat.id)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Note (optional)</label>
          <input
            type="text"
            placeholder="What was this for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="text-input"
          />
        </div>

        <button
          type="submit"
          className={`submit-btn ${type}`}
          disabled={!amount || !category}
        >
          Save {type === 'income' ? 'Income' : 'Expense'}
        </button>
      </form>
    </div>
  );
}
