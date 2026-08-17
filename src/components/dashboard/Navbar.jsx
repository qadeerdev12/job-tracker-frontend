import ThemeToggle from "../ThemeToggle";

// Slim top bar. The sidebar owns navigation, identity, and sign-out at every
// breakpoint, so this holds only the menu trigger (mobile) plus add and theme.
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

export default function Navbar({ activeTab, setActiveTab, setSidebarOpen }) {
  return (
    <header className="sticky top-0 z-30 bg-topbar backdrop-blur-md border-b border-line">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {/* Opens the sidebar drawer — mobile only, where the rail is off-canvas */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden -ml-1 p-2 text-body hover:text-heading hover:bg-card rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
            <h2 className="text-[15px] font-semibold text-heading tracking-tight truncate">
              {TITLES[activeTab] ?? ""}
            </h2>
          </div>

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
          </div>
        </div>
      </div>
    </header>
  );
}
