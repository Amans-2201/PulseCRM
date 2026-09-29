import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  MoreVertical, 
  Tag, 
  Eye, 
  Edit2, 
  Trash2, 
  Filter 
} from 'lucide-react';

export default function ContactsView({
  contacts = [],
  loading = false,
  searchTerm = '',
  setSearchTerm,
  statusFilter = 'all',
  setStatusFilter,
  onSelectContact,
  onEditContact,
  onDeleteContact,
  onNewContact
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const statuses = ['all', 'Lead', 'Prospect', 'Customer', 'Partner', 'Inactive'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Customer': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Prospect': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Lead': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Partner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAvatarGradient = (id) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-purple-500 to-violet-600',
      'from-rose-500 to-pink-600',
      'from-amber-500 to-orange-600',
    ];
    return gradients[(id || 0) % gradients.length];
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contacts by name, email, phone, company..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-2xs"
          />
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">No contacts found</h3>
              <p className="text-xs text-slate-500 mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search criteria or status filter.'
                  : 'Start by creating your first contact!'}
              </p>
            </div>
            <button
              onClick={onNewContact}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-6">Contact Name</th>
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Contact Info</th>
                  <th className="py-3.5 px-6">Tags</th>
                  <th className="py-3.5 px-6 text-center">Deals</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onSelectContact(contact.id)}
                  >
                    {/* Name + Title + Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                            contact.id
                          )} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}
                        >
                          {contact.first_name[0]}
                          {contact.last_name[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {contact.first_name} {contact.last_name}
                          </div>
                          {contact.title && (
                            <div className="text-xs text-slate-400">{contact.title}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium truncate max-w-[140px]">
                          {contact.company_name || 'Individual'}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block text-2xs px-2.5 py-0.5 rounded-full font-semibold border ${getStatusColor(
                          contact.status
                        )}`}
                      >
                        {contact.status}
                      </span>
                    </td>

                    {/* Contact Info (Email / Phone) */}
                    <td className="py-4 px-6 text-xs text-slate-500 space-y-1">
                      {contact.email && (
                        <div className="flex items-center space-x-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {contact.tags
                          ? contact.tags.split(',').slice(0, 2).map((t, idx) => (
                              <span
                                key={idx}
                                className="text-3xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                              >
                                {t.trim()}
                              </span>
                            ))
                          : <span className="text-slate-300 text-xs">—</span>}
                      </div>
                    </td>

                    {/* Deals Count */}
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-1 rounded-md bg-slate-100 text-slate-700">
                        <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
                        {contact.deals_count || 0}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onSelectContact(contact.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditContact(contact)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteContact(contact.id, `${contact.first_name} ${contact.last_name}`)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
