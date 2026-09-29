import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Tag, 
  Trash2,
  DollarSign
} from 'lucide-react';
import { api } from '../api';

export default function ContactDetailModal({ 
  contactId, 
  isOpen, 
  onClose, 
  onEdit, 
  onDataChanged 
}) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    if (contactId && isOpen) {
      loadContactDetails();
    }
  }, [contactId, isOpen]);

  const loadContactDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getContact(contactId);
      setContact(data);
    } catch (err) {
      console.error('Failed to load contact details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.createNote({
        contact_id: contactId,
        content: newNote.trim(),
      });
      setNewNote('');
      await loadContactDetails();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to add note: ' + err.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.deleteNote(noteId);
      await loadContactDetails();
    } catch (err) {
      alert('Failed to delete note: ' + err.message);
    }
  };

  const handleToggleActivity = async (activity) => {
    const newStatus = activity.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.updateActivity(activity.id, { status: newStatus });
      await loadContactDetails();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      alert('Failed to update activity: ' + err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          {loading ? (
            <div className="text-sm text-slate-500">Loading contact details...</div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
                {contact.first_name[0]}{contact.last_name[0]}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-bold text-slate-900">
                    {contact.first_name} {contact.last_name}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      contact.status === 'Customer'
                        ? 'bg-emerald-100 text-emerald-800'
                        : contact.status === 'Prospect'
                        ? 'bg-blue-100 text-blue-800'
                        : contact.status === 'Partner'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {contact.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {contact.title ? `${contact.title} at ` : ''}
                  <span className="font-semibold text-slate-700">
                    {contact.company_name || 'Individual'}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {contact && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(contact);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Contact Info Pills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{contact.email || 'No email specified'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{contact.phone || 'No phone specified'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Company: {contact.company_name || 'Individual'}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Added: {new Date(contact.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Tags */}
            {contact.tags && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-medium"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Associated Deals */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Associated Deals ({contact.deals ? contact.deals.length : 0})
              </h4>
              {(!contact.deals || contact.deals.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No deals attached to this contact yet.</p>
              ) : (
                <div className="space-y-2">
                  {contact.deals.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{d.title}</p>
                          <p className="text-xs text-slate-500">Stage: {d.stage.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        ${d.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activities Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Activities & Tasks ({contact.activities ? contact.activities.length : 0})
              </h4>
              {(!contact.activities || contact.activities.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No activities planned.</p>
              ) : (
                <div className="space-y-2">
                  {contact.activities.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        a.status === 'Completed'
                          ? 'bg-slate-50/60 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleToggleActivity(a)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                            a.status === 'Completed'
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-slate-300 hover:border-indigo-600'
                          }`}
                        >
                          {a.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <div>
                          <p className={`text-sm font-medium ${a.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {a.subject}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <span>{a.type}</span>
                            <span>•</span>
                            <span>Due: {a.due_date} {a.due_time}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-2xs px-2 py-0.5 rounded font-semibold uppercase bg-slate-100 text-slate-600">
                        {a.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes & Interaction Logs */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Notes & Timeline
              </h4>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Log a call summary, quick update, or meeting note..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Add Note
                  </button>
                </div>
              </form>

              {(!contact.notes || contact.notes.length === 0) ? (
                <p className="text-xs text-slate-400 italic">No notes recorded yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {contact.notes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start justify-between text-xs group"
                    >
                      <div className="space-y-1">
                        <p className="text-slate-700 whitespace-pre-wrap">{n.content}</p>
                        <span className="text-3xs text-slate-400 block">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
