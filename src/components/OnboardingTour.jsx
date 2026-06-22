import { useState, useEffect, useCallback, useRef } from "react";

const STEPS = [
  {
    target: "[data-tour='welcome']",
    title: "Welcome to TailorTrack!",
    body: "Your personal job application tracker. Let's take a quick tour of the key features.",
    placement: "bottom",
    noHighlight: true,
  },
  {
    target: "[data-tour='summary-cards']",
    title: "Application Summary",
    body: "See your job search at a glance — applications by status and total count, updated in real time.",
    placement: "bottom",
  },
  {
    target: "[data-tour='weekly-goal']",
    title: "Weekly Goal",
    body: "Set a weekly target and track your progress. Click \"Edit goal\" to customize it.",
    placement: "left",
  },
  {
    target: "[data-tour='add-job-btn']",
    title: "Add Applications",
    body: "Click here to log a new job application. Track company, role, status, contacts, and more.",
    placement: "bottom",
  },
  {
    target: "[data-tour='nav-tabs']",
    title: "Navigate Sections",
    body: "Switch between Dashboard, Applications, Interviews, Documents, AI Tailor, and more.",
    placement: "bottom",
  },
  {
    target: "[data-tour='charts']",
    title: "Visual Analytics",
    body: "Charts show your status breakdown and weekly activity. Scroll down for monthly trends, funnel analysis, and pipeline timing.",
    placement: "top",
  },
  {
    target: "[data-tour='theme-toggle']",
    title: "Dark & Light Mode",
    body: "Toggle between dark and light themes to suit your preference.",
    placement: "bottom",
  },
];

const STORAGE_KEY = "tailortrack-onboarding-complete";

export default function OnboardingTour({ loading }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [rect, setRect] = useState(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (loading) return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const measure = useCallback(() => {
    const current = STEPS[step];
    if (!current || current.noHighlight) {
      setRect(null);
      return;
    }
    const el = document.querySelector(current.target);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top + window.scrollY, left: r.left, width: r.width, height: r.height });
      const tooltipH = 200;
      const placement = current.placement;
      if (placement === "top" && r.top < tooltipH) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (placement === "bottom" && r.bottom > window.innerHeight - tooltipH) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setRect(null);
    }
  }, [step]);

  useEffect(() => {
    if (!visible) return;
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [visible, step, measure]);

  const finish = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const current = STEPS[step];
  const pad = 8;

  const getTooltipStyle = () => {
    if (!rect || current.noHighlight) {
      return { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const style = { position: "absolute" };
    const placement = current.placement;

    if (placement === "bottom") {
      style.top = rect.top + rect.height + pad + 12;
      style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336));
    } else if (placement === "top") {
      style.top = rect.top - pad - 200;
      style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 336));
    } else if (placement === "left") {
      style.top = rect.top + rect.height / 2 - 80;
      style.left = Math.max(16, rect.left - 336);
    } else if (placement === "right") {
      style.top = rect.top + rect.height / 2 - 80;
      style.left = rect.left + rect.width + pad + 12;
    }

    return style;
  };

  const tooltipStyle = getTooltipStyle();

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={finish}>
        {rect && !current.noHighlight ? (
          <svg className="w-full h-full" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: document.documentElement.scrollHeight }}>
            <defs>
              <mask id="tour-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - pad}
                  y={rect.top - pad}
                  width={rect.width + pad * 2}
                  height={rect.height + pad * 2}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#tour-mask)" />
          </svg>
        ) : (
          <div className="absolute inset-0 bg-black/60" />
        )}
      </div>

      {/* Spotlight ring */}
      {rect && !current.noHighlight && (
        <div
          className="absolute border-2 border-brand-400 rounded-xl pointer-events-none animate-pulse"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="w-[320px] bg-card border border-line-strong rounded-2xl shadow-2xl p-5 z-[201] animate-[fadeSlide_0.3s_ease-out]"
        style={tooltipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-bold text-heading">{current.title}</h3>
          <button onClick={finish} className="text-muted hover:text-heading transition-colors p-0.5 -mt-0.5 -mr-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <p className="text-sm text-body leading-relaxed mb-4">{current.body}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-5 bg-brand-400" : i < step ? "w-1.5 bg-brand-400/50" : "w-1.5 bg-line-strong"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="px-3 py-1.5 text-xs font-medium text-muted hover:text-heading rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            {step === 0 && (
              <button
                onClick={finish}
                className="px-3 py-1.5 text-xs font-medium text-muted hover:text-heading rounded-lg transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="px-4 py-1.5 text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
            >
              {step === STEPS.length - 1 ? "Get Started" : "Next"}
            </button>
          </div>
        </div>

        <p className="text-[10px] text-muted text-center mt-3">{step + 1} of {STEPS.length}</p>
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
