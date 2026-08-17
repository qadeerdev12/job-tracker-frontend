import ThemeToggle from "../ThemeToggle";
import Logo from "../Logo";

// Slim top bar. The sidebar owns navigation and identity on desktop, so this
// keeps only the actions: add, theme, and (on mobile) the brand + profile.
const TITLES = {
  dashboard: "Dashboard",
  applications: "Applications",
  interviews: "Interviews",
  documents: "Documents",
  archived: "Archived",
  activity: "Activity",
  ai: "AI Tailor",
  "interview-prep": "Interview Prep",
  add: "New Application",
  profile: "Profile",
};

export default function Navbar({ activeTab, setActiveTab, initials, handleLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-topbar backdrop-blur-md border-b border-line">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand shows on mobile only — the sidebar carries it from md up */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center">
              <Logo className="w-5 h-5 text-white" />
            </div>
            <span className="text-base font-extrabold text-brand-500 tracking-tight">TailorTrac</span>
          </div>

          <h2 className="hidden md:block text-[15px] font-semibold text-heading tracking-tight">
            {TITLES[activeTab] ?? ""}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("add")}
              className="group flex items-center gap-2 pl-3 pr-4 py-2.5 bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand-600/25 hover:shadow-brand-600/40 active:translate-y-px transition-all duration-150"
              data-tour="add-job-btn"
            >
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <span className="hidden sm:inline">Add Application</span>
              <span className="sm:hidden">Add</span>
            </button>

            <span data-tour="theme-toggle"><ThemeToggle /></span>

            {/* Profile + sign out live in the sidebar on desktop */}
            <button
              onClick={() => setActiveTab("profile")}
              className={`md:hidden w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all ${
                activeTab === "profile" ? "ring-2 ring-brand-400 ring-offset-2 ring-offset-page" : "hover:ring-2 hover:ring-brand-400/50"
              }`}
              title="Profile"
            >
              {initials}
            </button>
            {/* Desktop sign-out lives in the sidebar; this one is mobile-only,
                where the sidebar is hidden. */}
            <button
              onClick={handleLogout}
              className="md:hidden text-xs text-muted hover:text-red-400 transition-colors px-2"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
