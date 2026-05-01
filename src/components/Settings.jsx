import { useState } from 'react';
import { exportData, importData } from '../data/store';

export default function Settings({ onBack }) {
  const [importText, setImportText] = useState('');
  const [message, setMessage] = useState('');

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Data exported!');
  };

  const handleImport = () => {
    try {
      importData(importText);
      setMessage('Data imported successfully!');
      setImportText('');
    } catch {
      setMessage('Error: Invalid data format');
    }
  };

  return (
    <div className="settings">
      <header className="page-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h1>Settings</h1>
      </header>

      <section className="section">
        <h2>Backup & Restore</h2>
        <button className="primary-btn" onClick={handleExport}>Export Data</button>

        <div className="form-group" style={{ marginTop: 16 }}>
          <label>Import Data (paste JSON)</label>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            rows={4}
            className="text-input"
            placeholder="Paste exported JSON here..."
          />
          <button className="secondary-btn" onClick={handleImport} disabled={!importText}>
            Import Data
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </section>
    </div>
  );
}
