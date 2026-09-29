import React from 'react';
import { 
  Plus, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  User, 
  Calendar, 
  Edit2, 
  Trash2, 
  Trophy 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STAGES = [
  { id: 'lead', name: 'Lead In', color: 'border-t-blue-500' },
  { id: 'qualified', name: 'Qualified', color: 'border-t-cyan-500' },
  { id: 'proposal', name: 'Proposal Sent', color: 'border-t-amber-500' },
  { id: 'negotiation', name: 'In Negotiation', color: 'border-t-purple-500' },
  { id: 'won', name: 'Closed Won', color: 'border-t-emerald-500' },
  { id: 'lost', name: 'Closed Lost', color: 'border-t-slate-400' },
];

export default function DealsView({
  deals = [],
  loading = false,
  onNewDeal,
  onEditDeal,
  onDeleteDeal,
  onUpdateStage,
}) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleStageShift = (deal, direction) => {
    const currentIndex = STAGES.findIndex((s) => s.id === deal.stage);
    if (currentIndex === -1) return;

    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < STAGES.length) {
      const nextStage = STAGES[nextIndex].id;
      if (nextStage === 'won') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      onUpdateStage(deal.id, nextStage);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Deals Pipeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your opportunities across sales stages
          </p>
        </div>
        <button
          onClick={onNewDeal}
          className="flex items-center space-x-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Deal</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading pipeline...</div>
      ) : (
        /* Kanban Board Columns Container */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
          {STAGES.map((stage, stageIndex) => {
            const stageDeals = deals.filter((d) => d.stage === stage.id);
            const totalStageValue = stageDeals.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

            return (
              <div
                key={stage.id}
                className={`bg-slate-100/80 rounded-2xl p-3.5 border-t-4 ${stage.color} border border-slate-200/80 flex flex-col min-w-[240px]`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      {stage.id === 'won' && <Trophy className="w-4 h-4 text-emerald-600" />}
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {stage.name}
                      </h4>
                    </div>
                    <p className="text-xs font-semibold text-slate-600 mt-0.5">
                      {formatCurrency(totalStageValue)}
                    </p>
                  </div>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Deal Cards */}
                <div className="space-y-2.5">
                  {stageDeals.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300/80 rounded-xl">
                      Empty
                    </div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all group space-y-3"
                      >
                        {/* Title & Amount */}
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-800 leading-snug">
                            {deal.title}
                          </h5>
                          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={() => onEditDeal(deal)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Edit deal"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDeal(deal.id, deal.title)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                              title="Delete deal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-base font-extrabold text-slate-900">
                          {formatCurrency(deal.amount)}
                        </div>

                        {/* Company & Contact */}
                        <div className="space-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
                          {deal.company_name && (
                            <div className="flex items-center space-x-1.5 truncate">
                              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{deal.company_name}</span>
                            </div>
                          )}
                          {deal.first_name && (
                            <div className="flex items-center space-x-1.5 truncate">
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {deal.first_name} {deal.last_name}
                              </span>
                            </div>
                          )}
                          {deal.expected_close_date && (
                            <div className="flex items-center space-x-1.5 text-slate-400">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>Closes: {deal.expected_close_date}</span>
                            </div>
                          )}
                        </div>

                        {/* Probability Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-3xs text-slate-400 font-semibold uppercase">
                            <span>Win Prob</span>
                            <span>{deal.probability}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                deal.stage === 'won'
                                  ? 'bg-emerald-500'
                                  : deal.stage === 'lost'
                                  ? 'bg-slate-300'
                                  : 'bg-indigo-600'
                              }`}
                              style={{ width: `${deal.probability}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Stage Shift Controls */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <button
                            disabled={stageIndex === 0}
                            onClick={() => handleStageShift(deal, -1)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move to previous stage"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <span className="text-3xs font-medium text-slate-400">Move stage</span>
                          <button
                            disabled={stageIndex === STAGES.length - 1}
                            onClick={() => handleStageShift(deal, 1)}
                            className="p-1 rounded text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Move to next stage"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
