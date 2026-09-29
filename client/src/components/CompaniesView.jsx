import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Globe, 
  Phone, 
  MapPin, 
  Users, 
  Briefcase, 
  Edit2, 
  Trash2,
  DollarSign
} from 'lucide-react';

export default function CompaniesView({
  companies = [],
  loading = false,
  onNewCompany,
  onEditCompany,
  onDeleteCompany,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const filteredCompanies = companies.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.industry && c.industry.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Companies & Accounts</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your client organizations and accounts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search companies..."
              className="pl-9 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-56"
            />
          </div>

          <button
            onClick={onNewCompany}
            className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Company</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading companies...</div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">No companies found</h4>
          <p className="text-xs text-slate-500">
            {searchTerm ? 'Try a different search term.' : 'Add your first organization to organize contacts and deals.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((co) => (
            <div
              key={co.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg border border-indigo-100">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {co.name}
                      </h4>
                      {co.industry && (
                        <span className="inline-block text-2xs px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 mt-0.5">
                          {co.industry}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditCompany(co)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Edit company"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCompany(co.id, co.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Delete company"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-5 space-y-2 text-xs text-slate-500">
                  {co.website && (
                    <div className="flex items-center space-x-2 truncate">
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a
                        href={co.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline truncate"
                      >
                        {co.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {co.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{co.phone}</span>
                    </div>
                  )}
                  {co.address && (
                    <div className="flex items-center space-x-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{co.address}</span>
                    </div>
                  )}
                  {co.annual_revenue > 0 && (
                    <div className="flex items-center space-x-2 text-slate-700 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Est. Revenue: {formatCurrency(co.annual_revenue)} / yr</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Metrics */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {co.contacts_count || 0} Contacts
                </span>
                <span className="flex items-center">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  {co.deals_count || 0} Deals
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
