import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Building,
  ArrowRight,
  Calendar,
  Briefcase
} from 'lucide-react';

export default function DashboardView({ 
  stats, 
  onNavigate, 
  onToggleActivity, 
  onNewDeal, 
  onNewContact 
}) {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        Loading dashboard metrics...
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const stageLabels = {
    lead: 'Lead In',
    qualified: 'Qualified',
    proposal: 'Proposal Sent',
    negotiation: 'In Negotiation',
    won: 'Closed Won',
    lost: 'Closed Lost',
  };

  const stageColors = {
    lead: 'bg-blue-500',
    qualified: 'bg-cyan-500',
    proposal: 'bg-amber-500',
    negotiation: 'bg-purple-500',
    won: 'bg-emerald-500',
    lost: 'bg-slate-400',
  };

  const getStageTotal = (stage) => {
    const found = (stats.dealsByStage || []).find((s) => s.stage === stage);
    return found ? found.total_amount : 0;
  };

  const getStageCount = (stage) => {
    const found = (stats.dealsByStage || []).find((s) => s.stage === stage);
    return found ? found.count : 0;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Pipeline Value */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Pipeline</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatCurrency(stats.pipelineValue)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="font-semibold text-slate-700 mr-1">{stats.activeDeals}</span> active opportunities
          </div>
        </div>

        {/* Won Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Won Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 tracking-tight">
            {formatCurrency(stats.wonRevenue)}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold mr-1.5">
              {stats.winRate}%
            </span>
            win rate ({stats.wonDeals} deals won)
          </div>
        </div>

        {/* Contacts & Accounts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Contacts</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.totalContacts}
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-500">
            <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span className="font-semibold text-slate-700 mr-1">{stats.totalCompanies}</span> companies registered
          </div>
        </div>

        {/* Pending & Overdue Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasks & Follow-ups</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats.pendingActivities}
          </div>
          <div className="mt-2 flex items-center text-xs">
            {stats.overdueActivities > 0 ? (
              <span className="flex items-center text-rose-600 font-semibold">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {stats.overdueActivities} overdue
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">All tasks on track</span>
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Funnel Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pipeline Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Deal progression and volume by stage</p>
          </div>
          <button
            onClick={() => onNavigate('deals')}
            className="flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
          >
            <span>View Kanban Board</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map((stage) => {
            const amount = getStageTotal(stage);
            const count = getStageCount(stage);
            return (
              <div 
                key={stage} 
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${stageColors[stage]}`}></div>
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    {stageLabels[stage]}
                  </span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  {formatCurrency(amount)}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {count} {count === 1 ? 'deal' : 'deals'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Row: Upcoming Activities & Recent Deals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Upcoming Activities</h3>
            </div>
            <button
              onClick={() => onNavigate('activities')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {(!stats.upcomingActivities || stats.upcomingActivities.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No pending activities. Good job!</p>
            ) : (
              stats.upcomingActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => onToggleActivity(act)}
                      title="Mark as completed"
                      className="mt-0.5 w-5 h-5 rounded-md border-2 border-slate-300 hover:border-indigo-600 flex items-center justify-center text-white hover:bg-indigo-50 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-transparent hover:text-indigo-600" />
                    </button>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{act.subject}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                          {act.type}
                        </span>
                        {act.first_name && (
                          <span>With {act.first_name} {act.last_name}</span>
                        )}
                        <span className="flex items-center text-slate-400">
                          <Calendar className="w-3 h-3 mr-1 inline" />
                          {act.due_date} {act.due_time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-2xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider shrink-0 ${
                      act.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : act.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {act.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900">Recent Deals</h3>
            </div>
            <button
              onClick={() => onNavigate('deals')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              View pipeline
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {(!stats.recentDeals || stats.recentDeals.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No deals found. Create one to get started!</p>
            ) : (
              stats.recentDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{deal.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {deal.company_name || 'Individual'} • {deal.first_name ? `${deal.first_name} ${deal.last_name}` : 'No contact'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-slate-900">
                      {formatCurrency(deal.amount)}
                    </div>
                    <span
                      className={`inline-block text-2xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider mt-1 ${
                        deal.stage === 'won'
                          ? 'bg-emerald-100 text-emerald-800'
                          : deal.stage === 'lost'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {stageLabels[deal.stage] || deal.stage}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
