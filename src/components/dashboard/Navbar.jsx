import ThemeToggle from "../ThemeToggle";

export default function Navbar({ activeTab, setActiveTab, navItems, mobileMenuOpen, setMobileMenuOpen, initials, handleLogout }) {
  return (
    <nav className="sticky top-0 z-50 bg-topbar backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2" data-tour="welcome">
              <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20L17.5 6.5" stroke="currentColor" strokeWidth={2.5} /><path d="M17.5 6.5l2.5-2.5" stroke="currentColor" strokeWidth={1.5} /><circle cx="20" cy="4" r="1.5" fill="currentColor" /><path d="M4 20c0 0-1 -5 3-9" stroke="currentColor" strokeWidth={1.8} /><path d="M4 20c0 0 5 1 9-3" stroke="currentColor" strokeWidth={1.8} /></svg>
              </div>
              <span className="text-lg font-bold text-brand-400 tracking-tight">TailorTrack</span>
            </div>

            <div className="hidden md:flex items-center gap-1" data-tour="nav-tabs">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-brand-600/10 text-brand-400"
                      : "text-muted hover:text-heading hover:bg-card"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("add")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors"
              data-tour="add-job-btn"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              <span className="hidden sm:inline">Add</span>
            </button>
            <span data-tour="theme-toggle"><ThemeToggle /></span>
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={() => setActiveTab("profile")}
                className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-brand-400/50 transition-all"
                title="Profile"
              >
                {initials}
              </button>
              <button
                onClick={handleLogout}
                className="text-xs text-muted hover:text-red-400 transition-colors hidden sm:block"
              >
                Sign Out
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-muted hover:text-heading rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-3 border-t border-line mt-1 pt-2 flex flex-wrap gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-brand-600/10 text-brand-400"
                    : "text-muted hover:text-heading"
                }`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="sm:hidden px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
