import React from 'react';
import { Plus, Database, Sparkles } from 'lucide-react';

export default function Header({ 
  title, 
  subtitle, 
  onNewContact, 
  onNewDeal, 
  onNewActivity,
  sqliteInfo 
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        {sqliteInfo && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>SQLite: {sqliteInfo.sizeFormatted || 'Ready'}</span>
          </div>
        )}

        {onNewActivity && (
          <button
            onClick={onNewActivity}
            className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Task</span>
          </button>
        )}

        {onNewDeal && (
          <button
            onClick={onNewDeal}
            className="flex items-center space-x-1.5 px-3 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>New Deal</span>
          </button>
        )}

        {onNewContact && (
          <button
            onClick={onNewContact}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-shadow shadow-sm shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Contact</span>
          </button>
        )}
      </div>
    </header>
  );
}
