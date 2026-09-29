import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Calendar, 
  Clock, 
  User, 
  Briefcase, 
  CheckCircle2, 
  Circle, 
  Phone, 
  Mail, 
  Users, 
  FileText, 
  Trash2, 
  Edit2, 
  AlertCircle 
} from 'lucide-react';

export default function ActivitiesView({
  activities = [],
  loading = false,
  statusFilter = 'all',
  setStatusFilter,
  typeFilter = 'all',
  setTypeFilter,
  onToggleActivity,
  onNewActivity,
  onEditActivity,
  onDeleteActivity,
}) {
  const types = ['all', 'Task', 'Call', 'Meeting', 'Email', 'Follow-up'];
  const statuses = [
    { id: 'all', label: 'All Tasks' },
    { id: 'Pending', label: 'Pending' },
    { id: 'Completed', label: 'Completed' },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call': return <Phone className="w-4 h-4 text-emerald-600" />;
      case 'Meeting': return <Users className="w-4 h-4 text-indigo-600" />;
      case 'Email': return <Mail className="w-4 h-4 text-blue-600" />;
      case 'Follow-up': return <Clock className="w-4 h-4 text-purple-600" />;
      default: return <FileText className="w-4 h-4 text-amber-600" />;
    }
  };

  const isOverdue = (act) => {
    if (act.status === 'Completed' || !act.due_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return act.due_date < today;
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Tasks & Activities</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep track of sales tasks, calls, meetings, and deadlines
          </p>
        </div>

        <button
          onClick={onNewActivity}
          className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Activity</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Status Filter */}
        <div className="flex items-center space-x-1">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === s.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="flex items-center space-x-1 overflow-x-auto">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                typeFilter === t
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">No activities found</h4>
            <p className="text-xs text-slate-500">
              {statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Stay organized by scheduling your first task or follow-up!'}
            </p>
          </div>
        ) : (
          activities.map((act) => {
            const overdue = isOverdue(act);
            const isDone = act.status === 'Completed';

            return (
              <div
                key={act.id}
                className={`bg-white rounded-xl p-4 border transition-all flex items-start justify-between gap-4 group ${
                  isDone
                    ? 'border-slate-200 bg-slate-50/50 opacity-75'
                    : overdue
                    ? 'border-rose-200 shadow-xs'
                    : 'border-slate-200 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Left check and info */}
                <div className="flex items-start space-x-3.5 flex-1">
                  <button
                    onClick={() => onToggleActivity(act)}
                    className={`mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-slate-300 hover:border-indigo-600 text-transparent hover:text-indigo-600'
                    }`}
                    title={isDone ? 'Mark as pending' : 'Mark as completed'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 rounded-md bg-slate-100 shrink-0">
                        {getTypeIcon(act.type)}
                      </div>
                      <h4
                        className={`text-sm font-bold ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {act.subject}
                      </h4>
                    </div>

                    {act.description && (
                      <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                        {act.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="flex flex-wrap items-center gap-3 pl-7 text-xs text-slate-500 pt-1">
                      {act.due_date && (
                        <span
                          className={`flex items-center font-medium ${
                            overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                          }`}
                        >
                          {overdue ? (
                            <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          )}
                          {act.due_date} {act.due_time && `at ${act.due_time}`}
                          {overdue && ' (Overdue)'}
                        </span>
                      )}

                      {act.first_name && (
                        <span className="flex items-center text-slate-600">
                          <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {act.first_name} {act.last_name}
                          {act.company_name && ` (${act.company_name})`}
                        </span>
                      )}

                      {act.deal_title && (
                        <span className="flex items-center text-slate-600">
                          <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          {act.deal_title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`text-3xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      act.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : act.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {act.priority}
                  </span>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditActivity(act)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Edit activity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteActivity(act.id, act.subject)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Delete activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
