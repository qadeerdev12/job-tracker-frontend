import { useEffect } from "react";
import Logo from "../Logo";
import { avatarUrl } from "../profile/AvatarUpload";

// Icons keyed by nav id so useDashboardData's navItems stays a plain {id,label} list.
const ICONS = {
  dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
  applications: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zM3.75 12h.007v.008H3.75V12zm0 5.25h.007v.008H3.75v-.008z" />,
  interviews: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />,
  ai: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />,
  "interview-prep": <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />,
  documents: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 16.5v.75m3-3v3M15 12v5.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />,
  archived: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
  activity: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
};

// Eight items is a lot for a flat rail — group them so the eye can land.
const GROUPS = [
  { label: "Track", ids: ["dashboard", "applications", "interviews"] },
  { label: "AI Tools", ids: ["ai", "interview-prep"] },
  { label: "Library", ids: ["documents", "archived", "activity"] },
];

export default function Sidebar({ activeTab, setActiveTab, navItems, initials, userName, handleLogout, open, setOpen, avatarPath }) {
  const photo = avatarUrl(avatarPath);
  const byId = Object.fromEntries(navItems.map((i) => [i.id, i]));

  // Escape closes the mobile drawer
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Navigating closes the drawer; on desktop the sidebar is static so this is a no-op
  const go = (id) => { setActiveTab(id); setOpen(false); };

  return (
    <>
      {/* Backdrop — mobile only, and only while the drawer is open */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          aria-hidden="true"
        />
      )}

      {/* Drawer below md, static rail from md up.
          border-r matters in dark mode, where sidebar and page are nearly the same value. */}
      <aside
        className={`fixed inset-y-0 left-0 w-60 bg-sidebar border-r border-white/[0.07] flex flex-col z-50 transition-transform duration-200 ease-out md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0" data-tour="welcome">
        <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
          <Logo className="w-6 h-6 text-white" />
        </div>
        <span className="text-lg font-extrabold text-white tracking-tight">TailorTrac</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4" data-tour="nav-tabs">
        {GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              {group.label}
            </p>
            {group.ids.filter((id) => byId[id]).map((id) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className={`group relative w-full flex items-center gap-3 pl-3.5 pr-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all duration-150 ${
                    active
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                >
                  <svg
                    className={`w-[18px] h-[18px] shrink-0 transition-transform duration-150 ${active ? "" : "group-hover:scale-110"}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.7}
                  >
                    {ICONS[id]}
                  </svg>
                  <span className="truncate">{byId[id].label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          onClick={() => go("profile")}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors ${
            activeTab === "profile" ? "bg-white/[0.08]" : "hover:bg-white/[0.06]"
          }`}
        >
          {photo ? (
            <img src={photo} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <span className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </span>
          )}
          <span className="min-w-0 text-left">
            <span className="block text-sm font-medium text-white truncate">{userName}</span>
            <span className="block text-[11px] text-slate-500">View profile</span>
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 mt-1 text-[13px] text-slate-500 hover:text-red-400 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
          Sign out
        </button>
      </div>
      </aside>
    </>
  );
}
