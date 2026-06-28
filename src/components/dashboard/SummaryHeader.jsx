import axios from "axios";
import { API } from "../../utils/constants";
import { SummaryCardsSkeleton, GoalRingSkeleton } from "../Skeletons";

export default function SummaryHeader({
  loading, stats, totalApps, firstName, weeklyApps, weeklyGoal, setWeeklyGoal,
  goalPct, editingGoal, setEditingGoal, goalInput, setGoalInput, authHeader,
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });

  const summaryStats = [
    { label: "APPLIED", count: stats.Applied, color: "text-brand-400" },
    { label: "INTERVIEW", count: stats.Interview, color: "text-amber-400" },
    { label: "OFFER", count: stats.Offer, color: "text-emerald-400" },
    { label: "REJECTED", count: stats.Rejected, color: "text-red-400" },
    { label: "TOTAL", count: totalApps, color: "text-heading" },
  ];

  const saveGoal = (val) => {
    const v = Math.max(1, Math.min(100, parseInt(val) || 10));
    setWeeklyGoal(v);
    setGoalInput(String(v));
    setEditingGoal(false);
    axios.put(`${API}/api/jobs/settings`, { weeklyGoal: v }, authHeader()).catch(() => {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className="bg-card rounded-2xl border border-line p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <p className="text-sm text-muted mb-1">{dateStr}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-heading mb-6">{firstName}'s Summary</h1>

            {loading ? <SummaryCardsSkeleton /> : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4" data-tour="summary-cards">
                {summaryStats.map((stat) => (
                  <div key={stat.label} className="bg-page rounded-xl p-4 border border-line">
                    <p className="text-[11px] font-semibold text-muted tracking-wider mb-1">{stat.label}</p>
                    <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.count}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {loading ? <GoalRingSkeleton /> : <div className="flex flex-col items-center shrink-0" data-tour="weekly-goal">
            <p className="text-[11px] font-semibold text-muted tracking-wider mb-3">WEEKLY GOAL</p>
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-line-strong)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={goalPct >= 100 ? "#10b981" : goalPct >= 50 ? "#3b82f6" : "var(--color-brand-400)"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - goalPct / 100)}`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${goalPct >= 100 ? "text-emerald-400" : "text-heading"}`}>{weeklyApps}</span>
                <span className="text-[10px] text-muted">/ {weeklyGoal}</span>
              </div>
            </div>
            {goalPct >= 100 && (
              <p className="text-xs text-emerald-400 font-medium mt-2">Goal reached!</p>
            )}
            {editingGoal ? (
              <div className="flex items-center gap-1.5 mt-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  className="w-14 px-2 py-1 text-xs text-center border border-line-strong bg-input-bg rounded-lg text-heading outline-none focus:ring-1 focus:ring-brand-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveGoal(goalInput);
                    if (e.key === "Escape") setEditingGoal(false);
                  }}
                />
                <button
                  onClick={() => saveGoal(goalInput)}
                  className="px-2 py-1 text-xs bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Set
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingGoal(true)}
                className="text-[10px] text-muted hover:text-brand-400 mt-2 transition-colors"
              >
                Edit goal
              </button>
            )}
          </div>}
        </div>
      </div>
    </div>
  );
}
