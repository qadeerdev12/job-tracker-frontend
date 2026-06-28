import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { STATUS_STYLES, CHART_COLORS_LIGHT, CHART_COLORS_DARK } from "../../utils/constants";
import { timeAgo } from "../../utils/helpers";
import { ChartsSkeleton, AnalyticsSkeleton } from "../Skeletons";

export default function DashboardTab({
  loading, stats, totalApps, weeklyData, chartData, responseRate, successRate,
  avgDaysToInterview, stageMetrics, monthlyData, funnelData, reminders,
  recentActivity, setActiveTab,
}) {
  const isDark = document.documentElement.classList.contains("dark");
  const chartColors = isDark ? CHART_COLORS_DARK : CHART_COLORS_LIGHT;

  const tooltipStyle = {
    borderRadius: "12px",
    border: "1px solid var(--color-line-strong)",
    fontSize: "13px",
    backgroundColor: "var(--color-card)",
    color: "var(--color-heading)",
  };

  return (
    <div className="space-y-6">
      {loading ? <ChartsSkeleton /> : <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-tour="charts">
        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-heading">Status Breakdown</h3>
            <span className="text-xs text-muted">{totalApps} total</span>
          </div>
          <div className="flex justify-center">
            <PieChart width={280} height={240}>
              <Pie data={chartData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={chartColors[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "13px" }} />
            </PieChart>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-heading">Weekly Activity</h3>
            <span className="text-xs text-muted">Last 6 weeks</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-strong)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill={isDark ? "#3b82f6" : "#4f46e5"} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>}

      {loading ? <AnalyticsSkeleton /> : <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-line p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
            </div>
            <div>
              <p className="text-xs text-muted">Response Rate</p>
              <p className="text-2xl font-bold text-heading">{responseRate}%</p>
            </div>
          </div>
          <div className="w-full bg-line-strong rounded-full h-1.5 mt-2">
            <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${responseRate}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-line p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.27.308 6.023 6.023 0 01-2.27-.308" /></svg>
            </div>
            <div>
              <p className="text-xs text-muted">Success Rate</p>
              <p className="text-2xl font-bold text-heading">{successRate}%</p>
            </div>
          </div>
          <div className="w-full bg-line-strong rounded-full h-1.5 mt-2">
            <div className="bg-emerald-500 h-1.5 rounded-full transition-all" style={{ width: `${successRate}%` }} />
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-line p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-xs text-muted">Avg. Time to Interview</p>
              <p className="text-2xl font-bold text-heading">{avgDaysToInterview !== null ? `${avgDaysToInterview}d` : "—"}</p>
            </div>
          </div>
        </div>
      </div>}

      {/* Time-in-Stage Metrics */}
      <div className="bg-card rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Time in Pipeline
          </h3>
          <span className="text-xs text-muted">Based on timeline data</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Applied → Interview", value: stageMetrics.toInterview, count: stageMetrics.counts.toInterview, color: "bg-indigo-500", bgColor: "bg-indigo-500/10", textColor: "text-indigo-400" },
            { label: "Interview → Offer", value: stageMetrics.toOffer, count: stageMetrics.counts.toOffer, color: "bg-emerald-500", bgColor: "bg-emerald-500/10", textColor: "text-emerald-400" },
            { label: "Applied → Rejected", value: stageMetrics.toRejected, count: stageMetrics.counts.toRejected, color: "bg-red-500", bgColor: "bg-red-500/10", textColor: "text-red-400" },
            { label: "Full Pipeline", value: stageMetrics.pipeline, count: stageMetrics.counts.pipeline, color: "bg-violet-500", bgColor: "bg-violet-500/10", textColor: "text-violet-400" },
          ].map((m) => (
            <div key={m.label} className="bg-page rounded-xl p-4 border border-line">
              <p className="text-[11px] font-medium text-muted mb-1 truncate">{m.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-bold ${m.textColor}`}>{m.value !== null ? m.value : "—"}</span>
                {m.value !== null && <span className="text-xs text-muted">days</span>}
              </div>
              <p className="text-[10px] text-muted mt-1">{m.count} application{m.count !== 1 ? "s" : ""}</p>
              {m.value !== null && (
                <div className={`w-full ${m.bgColor} rounded-full h-1 mt-2`}>
                  <div className={`${m.color} h-1 rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, (m.value / 60) * 100)}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trends + Funnel Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-heading">Monthly Trends</h3>
            <div className="flex items-center gap-3">
              {[
                { label: "Applied", color: isDark ? "#818cf8" : "#6366f1" },
                { label: "Interview", color: isDark ? "#fbbf24" : "#f59e0b" },
                { label: "Offer", color: isDark ? "#34d399" : "#10b981" },
                { label: "Rejected", color: isDark ? "#94a3b8" : "#64748b" },
              ].map((s) => (
                <span key={s.label} className="flex items-center gap-1 text-[10px] text-muted">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gApplied" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDark ? "#818cf8" : "#6366f1"} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gInterview" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gOffer" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isDark ? "#34d399" : "#10b981"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line-strong)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--color-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="Applied" stroke={isDark ? "#818cf8" : "#6366f1"} fill="url(#gApplied)" strokeWidth={2} />
              <Area type="monotone" dataKey="Interview" stroke={isDark ? "#fbbf24" : "#f59e0b"} fill="url(#gInterview)" strokeWidth={2} />
              <Area type="monotone" dataKey="Offer" stroke={isDark ? "#34d399" : "#10b981"} fill="url(#gOffer)" strokeWidth={2} />
              <Area type="monotone" dataKey="Rejected" stroke={isDark ? "#94a3b8" : "#64748b"} fill="none" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-heading">Application Funnel</h3>
            <span className="text-xs text-muted">Conversion rates</span>
          </div>
          <div className="space-y-3">
            {funnelData.map((item, i) => {
              const colors = [isDark ? "#818cf8" : "#6366f1", isDark ? "#fbbf24" : "#f59e0b", isDark ? "#34d399" : "#10b981"];
              const widths = [100, 70, 45];
              const isLast = i === funnelData.length - 1;
              const conversionFromPrev = i > 0 && funnelData[i - 1].count > 0
                ? Math.round((item.count / funnelData[i - 1].count) * 100)
                : null;
              return (
                <div key={item.stage}>
                  {i > 0 && (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                      <span className="text-[11px] font-medium text-muted">{conversionFromPrev}% conversion</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center">
                    <div
                      className="relative rounded-lg py-3 px-4 flex items-center justify-between transition-all duration-500"
                      style={{
                        width: `${widths[i]}%`,
                        backgroundColor: `${colors[i]}15`,
                        borderLeft: `3px solid ${colors[i]}`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
                        <span className="text-sm font-medium text-heading">{item.stage}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-heading">{item.count}</span>
                        {!isLast && <span className="text-xs text-muted ml-1">({item.pct}%)</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {totalApps > 0 && stats.Rejected > 0 && (
            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between px-2">
              <span className="text-xs text-muted flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Rejected
              </span>
              <span className="text-xs font-medium text-red-400">{stats.Rejected} ({Math.round((stats.Rejected / totalApps) * 100)}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* Reminders */}
      {reminders.length > 0 && (
        <div className="bg-card rounded-2xl border border-line p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
              Follow-Up Reminders
            </h3>
            <span className="text-xs text-muted">{reminders.length} pending</span>
          </div>
          <div className="divide-y divide-line">
            {reminders.slice(0, 5).map((job) => {
              const td = new Date(); td.setHours(0,0,0,0);
              const fDate = new Date(job.followUpDate); fDate.setHours(0,0,0,0);
              const diffDays = Math.ceil((fDate - td) / 86400000);
              const isOverdue = diffDays < 0;
              const isToday = diffDays === 0;
              return (
                <div key={job._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isOverdue ? "bg-red-500/10 text-red-400" : isToday ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-heading truncate">{job.company}</p>
                    <p className="text-xs text-muted truncate">{job.role}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isOverdue ? "bg-red-500/10 text-red-400" : isToday ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"
                  }`}>
                    {isOverdue ? `Overdue ${Math.abs(diffDays)}d` : isToday ? "Due today" : `In ${diffDays}d`}
                  </span>
                  <span className="text-xs text-muted shrink-0 hidden sm:block">
                    {new Date(job.followUpDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-card rounded-2xl border border-line p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-heading">Recent Activity</h3>
          <button onClick={() => setActiveTab("applications")} className="text-xs text-brand-400 hover:text-brand-300 font-medium">View all</button>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-muted text-sm text-center py-8">No applications yet — add your first one!</p>
        ) : (
          <div className="divide-y divide-line">
            {recentActivity.map((job) => (
              <div key={job._id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[job.status]?.dot || "bg-gray-400"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-heading truncate">{job.company}</p>
                  <p className="text-xs text-muted truncate">{job.role}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[job.status]?.badge || "bg-gray-100 text-body"}`}>
                  {job.status}
                </span>
                <span className="text-xs text-muted shrink-0 w-20 text-right hidden sm:block">
                  {timeAgo(job.updatedAt || job.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
