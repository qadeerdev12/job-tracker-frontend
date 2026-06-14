function LandingPage({ setPage }) {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-brand-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-2xl font-extrabold text-brand-600">ApplyFlow</span>
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            Land Your Dream Job,
            <br />
            <span className="text-brand-100">One Application at a Time</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Track every application, interview, and offer in one beautiful dashboard.
            Stay organized and never miss an opportunity.
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
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-900 mb-4">
            Everything you need to manage your job search
          </h2>
          <p className="text-center text-gray-500 mb-14 max-w-2xl mx-auto">
            Simple, powerful, and designed to keep you on track
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-surface-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h2v8H3zm6-4h2v12H9zm6-6h2v18h-2zm6 10h2v8h-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Dashboard</h3>
              <p className="text-gray-500">
                See your application stats at a glance with beautiful charts and color-coded status cards.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-surface-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Tracking</h3>
              <p className="text-gray-500">
                Log companies, roles, and statuses. Filter and search through your applications in seconds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-surface-card rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Stay Organized</h3>
              <p className="text-gray-500">
                Never lose track of an opportunity. Update statuses as you progress through the hiring pipeline.
              </p>
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
            Join ApplyFlow and start organizing your applications today.
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
      <footer className="bg-surface-dark py-8 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-brand-300 font-bold">ApplyFlow</span>
          <p className="text-gray-500 text-sm mt-2">&copy; 2025 ApplyFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
