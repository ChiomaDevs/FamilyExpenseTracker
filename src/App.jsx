import { useState } from 'react';
import Dashboard from './components/Dashboard';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import MonthlyReport from './components/MonthlyReport';
import Insights from './components/Insights';
import './App.css';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'add', label: 'Add', icon: '➕' },
  { id: 'transactions', label: 'History', icon: '📋' },
  { id: 'report', label: 'Report', icon: '📊' },
  { id: 'insights', label: 'Insights', icon: '💡' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  const onTransactionAdded = () => {
    refresh();
    setActiveTab('dashboard');
  };

  return (
    <div className="app">
      <div className="app-content">
        {activeTab === 'dashboard' && <Dashboard key={refreshKey} onNavigate={setActiveTab} />}
        {activeTab === 'add' && <AddTransaction onSaved={onTransactionAdded} />}
        {activeTab === 'transactions' && <TransactionList key={refreshKey} onChanged={refresh} />}
        {activeTab === 'report' && <MonthlyReport key={refreshKey} />}
        {activeTab === 'insights' && <Insights key={refreshKey} />}
      </div>

      <nav className="bottom-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
