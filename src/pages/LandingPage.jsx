import { useState, useEffect, useRef } from "react";
import Logo from "../components/Logo";

const ROTATING_ROLES = ["engineers", "designers", "analysts", "marketers", "graduates"];

const FAQS = [
  {
    q: "Is TailorTrac really free?",
    a: "Yes. Tracking, analytics, reminders, documents, and CSV export are free. AI features (resume tailoring and interview prep) include 5 requests per day each.",
  },
  {
    q: "How does the AI resume tailoring work?",
    a: "Paste (or upload) your resume and a job description. The AI compares them and returns a match score, your strengths, the gaps, missing keywords, and rewritten bullet points tailored to that specific role.",
  },
  {
    q: "What is AI Interview Prep?",
    a: "Enter a company and role — optionally with the job description and your resume — and get likely behavioral and technical questions, STAR answer tips, smart questions to ask the interviewer, and a preparation checklist.",
  },
  {
    q: "Is my data private?",
    a: "Your applications and documents belong to you. Data is stored securely, AI requests are processed server-side, and you can export everything to CSV or delete your account (and all data) at any time.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes — TailorTrac is fully responsive with a mobile-optimized navigation, so you can log an application right after you hit submit.",
  },
];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_ROLES.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`inline-block text-accent-400 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {ROTATING_ROLES[index]}
    </span>
  );
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
    >
      {children}
    </div>
  );
}

function ScoreRing({ score }) {
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-line-strong)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none" stroke="#10b981" strokeWidth="8"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-heading">{score}</span>
        <span className="text-[9px] text-muted font-semibold tracking-wider">MATCH</span>
      </div>
    </div>
  );
}

function LandingPage({ setPage }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-page">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-topbar backdrop-blur-md z-50 border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center">
              <Logo className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-brand-600">TailorTrac</span>
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
      <section className="relative pt-32 pb-20 px-6 bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 rounded-full text-white/90 text-sm font-medium mb-6 backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            AI resume tailoring + interview prep, built in
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            The job tracker that gets
            <br />
            <RotatingWord /> <span className="text-white">hired.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Track every application, see what's working with real-time analytics, tailor your resume with AI, and walk into interviews prepared — all in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
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

          {/* Hero dashboard mock */}
          <FadeIn>
            <div className="max-w-3xl mx-auto bg-card/95 backdrop-blur rounded-2xl shadow-2xl border border-white/20 p-5 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-semibold text-muted tracking-wider">THIS WEEK</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "APPLIED", value: "24", color: "text-brand-500" },
                  { label: "INTERVIEWS", value: "6", color: "text-amber-500" },
                  { label: "OFFERS", value: "2", color: "text-emerald-500" },
                  { label: "RESPONSE RATE", value: "33%", color: "text-heading" },
                ].map((s) => (
                  <div key={s.label} className="bg-page rounded-xl p-3 border border-line">
                    <p className="text-[9px] font-semibold text-muted tracking-wider mb-1">{s.label}</p>
                    <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-end gap-1.5 h-16 px-1">
                {[35, 55, 40, 70, 60, 85, 75].map((h, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-brand-500 to-brand-400 rounded-t-md opacity-80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Proof: AI Tailor mock */}
      <section className="py-20 px-6 bg-page">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <p className="text-center text-xs font-bold tracking-[0.2em] text-brand-500 mb-3">THE PROOF</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-heading mb-4">
              See your resume the way recruiters do
            </h2>
            <p className="text-center text-body mb-14 max-w-2xl mx-auto">
              Paste a job description and your resume — the AI scores the match, finds the gaps, and rewrites your bullets for that exact role.
            </p>
          </FadeIn>

          <FadeIn delay={100}>
            <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-line shadow-xl overflow-hidden">
              <div className="border-b border-line px-6 py-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted tracking-wider">AI RESUME TAILOR · FRONTEND ENGINEER</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] font-bold rounded-full">AI</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center gap-3">
                  <ScoreRing score={87} />
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold rounded-full">STRONG MATCH</span>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted tracking-wider mb-2">STRENGTHS FOUND</p>
                    <div className="flex flex-wrap gap-2">
                      {["React experience", "Quantified impact", "CI/CD pipelines"].map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-lg border border-emerald-200 dark:border-emerald-800">✓ {s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted tracking-wider mb-2">GAPS TO CLOSE</p>
                    <div className="flex flex-wrap gap-2">
                      {["TypeScript", "Accessibility (a11y)"].map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-lg border border-amber-200 dark:border-amber-800">! {s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-line grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 md:border-r border-line">
                  <p className="text-[10px] font-bold text-muted tracking-wider mb-2">BEFORE</p>
                  <p className="text-sm text-body">Built a dashboard app with React and deployed it online.</p>
                </div>
                <div className="p-6 bg-brand-50/50 dark:bg-brand-900/10">
                  <p className="text-[10px] font-bold text-brand-500 tracking-wider mb-2">AFTER · AI REWRITE</p>
                  <p className="text-sm text-heading font-medium">Shipped a React analytics dashboard used by 200+ weekly users, cutting report turnaround from days to minutes.</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The Loop: numbered walkthrough */}
      <section className="py-20 px-6 bg-card border-y border-line">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <p className="text-center text-xs font-bold tracking-[0.2em] text-brand-500 mb-3">THE LOOP</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-heading mb-14">
              From application to offer
            </h2>
          </FadeIn>

          <div className="space-y-16">
            {/* 01 Track */}
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-5xl font-extrabold text-line-strong mb-3">01</p>
                  <h3 className="text-2xl font-bold text-heading mb-3">Track every application</h3>
                  <p className="text-body">Log company, role, status, tags, contacts, and follow-up dates. Filter and search everything in seconds — no more spreadsheet chaos.</p>
                </div>
                <div className="bg-page rounded-2xl border border-line p-4 space-y-2">
                  {[
                    { company: "Stripe", role: "Frontend Engineer", status: "Interview", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
                    { company: "Vercel", role: "Product Engineer", status: "Applied", color: "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" },
                    { company: "Linear", role: "Full Stack Developer", status: "Offer", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
                  ].map((j) => (
                    <div key={j.company} className="flex items-center justify-between bg-card rounded-xl border border-line px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-heading">{j.company}</p>
                        <p className="text-xs text-muted">{j.role}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${j.color}`}>{j.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* 02 Analyze */}
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="order-1 md:order-2">
                  <p className="text-5xl font-extrabold text-line-strong mb-3">02</p>
                  <h3 className="text-2xl font-bold text-heading mb-3">See what's working</h3>
                  <p className="text-body">Response rates, funnel conversion, time-in-stage, and monthly trends. Set a weekly application goal and watch the ring fill up.</p>
                </div>
                <div className="order-2 md:order-1 bg-page rounded-2xl border border-line p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-semibold text-muted tracking-wider">APPLICATION FUNNEL</span>
                  </div>
                  {[
                    { label: "Applied", pct: 100, color: "bg-brand-500" },
                    { label: "Interview", pct: 42, color: "bg-amber-500" },
                    { label: "Offer", pct: 15, color: "bg-emerald-500" },
                  ].map((row) => (
                    <div key={row.label} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-heading">{row.label}</span>
                        <span className="text-muted">{row.pct}%</span>
                      </div>
                      <div className="h-2.5 bg-line rounded-full overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full`} style={{ width: `${row.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* 03 Tailor */}
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-5xl font-extrabold text-line-strong mb-3">03</p>
                  <h3 className="text-2xl font-bold text-heading mb-3">Tailor your resume with AI</h3>
                  <p className="text-body">Upload or paste your resume against any job description. Get a match score, missing keywords, and bullet rewrites built for that role — not generic advice.</p>
                </div>
                <div className="bg-page rounded-2xl border border-line p-5">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {["React", "TypeScript", "Node.js", "REST APIs", "Testing", "CI/CD"].map((k) => (
                      <span key={k} className="px-2.5 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium rounded-lg">{k}</span>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-muted tracking-wider mb-1">KEYWORDS THE JOB WANTS</p>
                  <p className="text-xs text-body">Add these to your resume where they're honestly true — they're what the screening software scans for.</p>
                </div>
              </div>
            </FadeIn>

            {/* 04 Prep */}
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="order-1 md:order-2">
                  <p className="text-5xl font-extrabold text-line-strong mb-3">04</p>
                  <h3 className="text-2xl font-bold text-heading mb-3">Walk in prepared</h3>
                  <p className="text-body">AI Interview Prep generates likely behavioral and technical questions for the exact company and role, with STAR tips, smart questions to ask, and a prep checklist.</p>
                </div>
                <div className="order-2 md:order-1 bg-page rounded-2xl border border-line p-5 space-y-2.5">
                  {[
                    "Tell me about a time you disagreed with a teammate...",
                    "How would you optimize a slow React render?",
                    "Why do you want to work at Stripe?",
                  ].map((q, i) => (
                    <div key={i} className="flex items-center gap-3 bg-card rounded-xl border border-line px-4 py-3">
                      <span className="w-5 h-5 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                      <p className="text-xs text-heading font-medium truncate">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="py-16 px-6 bg-page">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            { value: "Free", label: "TO GET STARTED — NO CARD" },
            { value: "10", label: "AI REQUESTS PER DAY, EVERY DAY" },
            { value: "1", label: "DASHBOARD FOR YOUR WHOLE SEARCH" },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 100}>
              <p className="text-4xl font-extrabold text-brand-600 mb-2">{s.value}</p>
              <p className="text-[11px] font-semibold text-muted tracking-wider">{s.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 bg-card border-y border-line">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-center text-xs font-bold tracking-[0.2em] text-brand-500 mb-3">QUESTIONS</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-heading mb-12">
              Answers, briefly
            </h2>
          </FadeIn>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FadeIn key={i} delay={i * 60}>
                <div className="border border-line rounded-2xl overflow-hidden bg-page">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="text-sm font-semibold text-heading pr-4">{faq.q}</span>
                    <svg className={`w-4 h-4 text-muted transition-transform shrink-0 ${openFaq === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-4">
                      <p className="text-sm text-body">{faq.a}</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
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
            Join TailorTrac today — it's free to get started.
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
            <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-md flex items-center justify-center">
              <Logo className="w-5 h-5 text-white" />
            </div>
            <span className="text-brand-400 font-bold">TailorTrac</span>
          </div>
          <p className="text-muted text-sm mt-2">&copy; 2026 TailorTrac. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
