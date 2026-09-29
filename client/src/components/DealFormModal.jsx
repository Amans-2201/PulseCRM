import React, { useState, useEffect } from 'react';
import { X, Briefcase, DollarSign, Calendar, Building2, User, Percent } from 'lucide-react';

export default function DealFormModal({
  isOpen,
  onClose,
  onSave,
  deal = null,
  contacts = [],
  companies = [],
}) {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    stage: 'lead',
    probability: 20,
    expected_close_date: '',
    contact_id: '',
    company_id: '',
  });

  const stageProbabilities = {
    lead: 20,
    qualified: 40,
    proposal: 60,
    negotiation: 80,
    won: 100,
    lost: 0,
  };

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        amount: deal.amount || '',
        stage: deal.stage || 'lead',
        probability: deal.probability !== undefined ? deal.probability : 20,
        expected_close_date: deal.expected_close_date || '',
        contact_id: deal.contact_id || '',
        company_id: deal.company_id || '',
      });
    } else {
      const today = new Date();
      today.setDate(today.getDate() + 30);
      const defaultDate = today.toISOString().split('T')[0];

      setFormData({
        title: '',
        amount: '',
        stage: 'lead',
        probability: 20,
        expected_close_date: defaultDate,
        contact_id: '',
        company_id: '',
      });
    }
  }, [deal, isOpen]);

  if (!isOpen) return null;

  const handleStageChange = (newStage) => {
    setFormData((prev) => ({
      ...prev,
      stage: newStage,
      probability: stageProbabilities[newStage] !== undefined ? stageProbabilities[newStage] : prev.probability,
    }));
  };

  const handleContactChange = (e) => {
    const cid = e.target.value;
    const selectedContact = contacts.find((c) => String(c.id) === String(cid));
    setFormData((prev) => ({
      ...prev,
      contact_id: cid,
      company_id: (selectedContact && selectedContact.company_id) ? selectedContact.company_id : prev.company_id,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a deal title.');
      return;
    }
    onSave({
      ...formData,
      amount: Number(formData.amount) || 0,
      probability: Number(formData.probability) || 0,
      contact_id: formData.contact_id ? Number(formData.contact_id) : null,
      company_id: formData.company_id ? Number(formData.company_id) : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-lg">
              {deal ? 'Edit Deal' : 'Create New Deal'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Deal Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. Enterprise Cloud License Q3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Amount (USD)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="25000"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Expected Close Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="date"
                  value={formData.expected_close_date}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Pipeline Stage
              </label>
              <select
                value={formData.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="lead">Lead In (20%)</option>
                <option value="qualified">Qualified (40%)</option>
                <option value="proposal">Proposal Sent (60%)</option>
                <option value="negotiation">In Negotiation (80%)</option>
                <option value="won">Closed Won (100%)</option>
                <option value="lost">Closed Lost (0%)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Win Probability (%)
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Primary Contact
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={formData.contact_id}
                  onChange={handleContactChange}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="">None / Unassigned</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Company / Organization
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                >
                  <option value="">None / Unassigned</option>
                  {companies.map((co) => (
                    <option key={co.id} value={co.id}>
                      {co.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {deal ? 'Save Changes' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
