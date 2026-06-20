function LandingPage({ setPage }) {
  return (
    <div className="min-h-screen bg-page">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-topbar backdrop-blur-md z-50 border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20L17.5 6.5" stroke="currentColor" strokeWidth={2.5} /><path d="M17.5 6.5l2.5-2.5" stroke="currentColor" strokeWidth={1.5} /><circle cx="20" cy="4" r="1.5" fill="currentColor" /><path d="M4 20c0 0-1 -5 3-9" stroke="currentColor" strokeWidth={1.8} /><path d="M4 20c0 0 5 1 9-3" stroke="currentColor" strokeWidth={1.8} /></svg>
            </div>
            <span className="text-2xl font-extrabold text-brand-600">TailorTrack</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setPage("login")}
              className="px-5 py-2 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => setPage("register")}
              className="px-5 py-2 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            Now with AI-powered resume tailoring
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Land Your Dream Job,
            <br />
            <span className="text-brand-100">One Application at a Time</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Track applications, analyse your progress with real-time analytics, and tailor your resume with AI — all in one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setPage("register")}
              className="px-8 py-4 bg-white text-brand-600 font-bold rounded-2xl text-lg hover:bg-brand-50 transition-colors shadow-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => setPage("login")}
              className="px-8 py-4 border-2 border-white text-white font-bold rounded-2xl text-lg hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-page">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-heading mb-4">
            Everything you need to manage your job search
          </h2>
          <p className="text-center text-body mb-14 max-w-2xl mx-auto">
            From tracking to tailoring — tools built for job seekers who mean business
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Resume Tailor */}
            <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center border border-line relative overflow-hidden">
              <div className="absolute top-3 right-3 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">AI</div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">AI Resume Tailor</h3>
              <p className="text-body">
                Paste your resume and a job description — AI compares them and gives you a match score, gap analysis, and rewritten bullet points.
              </p>
            </div>

            {/* Dashboard Analytics */}
            <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center border border-line">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">Dashboard Analytics</h3>
              <p className="text-body">
                Response rates, success rates, monthly trends, and an application funnel — see your job search performance at a glance.
              </p>
            </div>

            {/* Smart Tracking */}
            <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center border border-line">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">Smart Tracking</h3>
              <p className="text-body">
                Log companies, roles, statuses, and tags. Filter, search, and sort through your applications in seconds.
              </p>
            </div>

            {/* Activity Timeline */}
            <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center border border-line">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">Activity Timeline</h3>
              <p className="text-body">
                Every action is logged — status changes, edits, archives. See your full job search history in one feed.
              </p>
            </div>

            {/* Follow-Up Reminders */}
            <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center border border-line">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">Follow-Up Reminders</h3>
              <p className="text-body">
                Set follow-up dates and get visual reminders on your dashboard — never miss a chance to follow up.
              </p>
            </div>

            {/* Export & Archive */}
            <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center border border-line">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-heading mb-3">Export & Archive</h3>
              <p className="text-body">
                Export your data to CSV anytime. Archive old applications to keep your workspace clean and focused.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-card border-y border-line">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-heading mb-14">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-bold text-heading mb-2">Add Applications</h3>
              <p className="text-body text-sm">Log each job with company, role, status, tags, notes, and a follow-up date.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-bold text-heading mb-2">Track Progress</h3>
              <p className="text-body text-sm">Update statuses as you move through interviews. Watch your analytics grow in real time.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-bold text-heading mb-2">Tailor with AI</h3>
              <p className="text-body text-sm">Paste a job description and your resume — get a personalised gap analysis and rewritten bullets.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 bg-gradient-to-br from-accent-500 via-brand-500 to-brand-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
            Ready to take control of your job search?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Join TailorTrack today — it's free to get started.
          </p>
          <button
            onClick={() => setPage("register")}
            className="px-10 py-4 bg-white text-brand-600 font-bold rounded-2xl text-lg hover:bg-brand-50 transition-colors shadow-lg"
          >
            Sign Up Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-6 h-6 bg-gradient-to-br from-brand-400 to-brand-600 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20L17.5 6.5" stroke="currentColor" strokeWidth={2.5} /><path d="M17.5 6.5l2.5-2.5" stroke="currentColor" strokeWidth={1.5} /><circle cx="20" cy="4" r="1.5" fill="currentColor" /><path d="M4 20c0 0-1 -5 3-9" stroke="currentColor" strokeWidth={1.8} /><path d="M4 20c0 0 5 1 9-3" stroke="currentColor" strokeWidth={1.8} /></svg>
            </div>
            <span className="text-brand-400 font-bold">TailorTrack</span>
          </div>
          <p className="text-muted text-sm mt-2">&copy; 2026 TailorTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
