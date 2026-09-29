import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  RefreshCw, 
  HardDrive, 
  Server, 
  Info, 
  CheckCircle2, 
  Folder, 
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api';

export default function SettingsView({ sqliteInfo, onRefreshInfo, onResetData }) {
  const [resetting, setResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    if (
      !confirm(
        'Are you sure you want to reset all data? This will clear current records and re-seed sample demo contacts, companies, deals, and activities.'
      )
    ) {
      return;
    }

    setResetting(true);
    try {
      await api.resetDatabase();
      await onResetData();
      alert('Database reset to sample demo data successfully!');
    } catch (err) {
      alert('Failed to reset database: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  const copyPath = () => {
    if (sqliteInfo && sqliteInfo.dbPath) {
      navigator.clipboard.writeText(sqliteInfo.dbPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Database & System Settings</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Local SQLite3 storage configuration and database maintenance
        </p>
      </div>

      {/* Database Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">SQLite 3 Local Database</h4>
              <p className="text-xs text-slate-500">
                Engine: SQLite v{sqliteInfo?.sqliteVersion || '3.x'} (WAL Journaling Enabled)
              </p>
            </div>
          </div>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Connected & Healthy</span>
          </span>
        </div>

        {/* Database File Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Folder className="w-4 h-4 mr-1.5 text-slate-400" />
              Windows File Path
            </div>
            <div className="font-mono text-xs text-slate-800 break-all select-all pt-1">
              {sqliteInfo?.dbPath || 'Loading path...'}
            </div>
            <button
              onClick={copyPath}
              className="text-2xs font-semibold text-indigo-600 hover:text-indigo-800 mt-1 cursor-pointer block"
            >
              {copied ? '✓ Copied to clipboard!' : 'Copy absolute path'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <HardDrive className="w-4 h-4 mr-1.5 text-slate-400" />
              Database Storage Size
            </div>
            <div className="text-xl font-bold text-slate-900 pt-1">
              {sqliteInfo?.sizeFormatted || '0 KB'}
            </div>
            <p className="text-xs text-slate-400">Zero cloud dependencies. 100% offline data.</p>
          </div>
        </div>

        {/* Table Records Summary */}
        <div>
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Stored Tables & Record Counts
          </h5>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {sqliteInfo?.tables &&
              Object.entries(sqliteInfo.tables).map(([table, count]) => (
                <div key={table} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-lg font-bold text-slate-900">{count}</div>
                  <div className="text-xs font-medium text-slate-500 capitalize">{table}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <a
            href={api.exportDatabaseUrl}
            download="crm-backup.json"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Database JSON Backup</span>
          </a>

          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? 'Resetting...' : 'Reset to Sample Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* Windows Quick Reference */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-5 h-5 text-indigo-600" />
          <h4 className="font-bold text-slate-900 text-base">Running Locally on Windows</h4>
        </div>

        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
              1
            </span>
            <p>
              <strong>Development mode:</strong> Run <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">npm run dev</code> from the root folder. Both the Express SQLite backend (port 5000) and the Vite React frontend (port 3000) will start together.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
              2
            </span>
            <p>
              <strong>Single-click launcher:</strong> Double-click <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600">start-crm.bat</code> in File Explorer to launch the application and automatically open your default browser.
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
              3
            </span>
            <p>
              <strong>Local file persistence:</strong> Your CRM data is preserved in <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">crm.db</code> using SQLite with Write-Ahead Logging (WAL) for durability and fast concurrent queries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
