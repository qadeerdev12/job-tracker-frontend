import { inputClass } from "../../utils/constants";
import ProfileSection from "./ProfileSection";

// Generic editor for the four list sections (experience, projects, education,
// certifications). `fields` describes each entry's shape so the sections stay
// declarative rather than four near-identical blocks of JSX.
//
// field: { key, label, type?: "text"|"textarea"|"tags"|"checkbox", placeholder?, half?: bool }
export default function RepeatableList({
  title, description, items, setItems, fields, blank, addLabel, emptyHint,
}) {
  const update = (index, key, value) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  };

  const remove = (index) => setItems(items.filter((_, i) => i !== index));
  const add = () => setItems([...items, { ...blank }]);

  return (
    <ProfileSection
      title={title}
      description={description}
      action={
        <button
          type="button"
          onClick={add}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 border border-brand-300 dark:border-brand-700 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          {addLabel}
        </button>
      }
    >
      {items.length === 0 && (
        <p className="text-sm text-muted py-6 text-center border border-dashed border-line rounded-xl">
          {emptyHint}
        </p>
      )}

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="relative rounded-xl border border-line bg-page p-4">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-3 right-3 p-1.5 text-muted hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-colors"
              aria-label={`Remove entry ${index + 1}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
              {fields.map((f) => {
                const value = item[f.key];
                const wrapClass = f.type === "textarea" || f.type === "tags" || !f.half
                  ? "sm:col-span-2"
                  : "";

                return (
                  <div key={f.key} className={wrapClass}>
                    {f.type !== "checkbox" && (
                      <label className="block text-[11px] font-medium text-body mb-1">{f.label}</label>
                    )}

                    {f.type === "textarea" && (
                      <textarea
                        value={value || ""}
                        onChange={(e) => update(index, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        rows={3}
                        maxLength={3000}
                        className={`${inputClass} resize-y`}
                      />
                    )}

                    {f.type === "tags" && (
                      <input
                        type="text"
                        value={(value || []).join(", ")}
                        onChange={(e) => update(index, f.key, e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                        placeholder={f.placeholder}
                        className={inputClass}
                      />
                    )}

                    {f.type === "checkbox" && (
                      <label className="flex items-center gap-2 text-xs text-body pt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => update(index, f.key, e.target.checked)}
                          className="rounded border-line-strong text-brand-600 focus:ring-brand-500"
                        />
                        {f.label}
                      </label>
                    )}

                    {(!f.type || f.type === "text") && (
                      <input
                        type="text"
                        value={value || ""}
                        onChange={(e) => update(index, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        maxLength={300}
                        className={inputClass}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ProfileSection>
  );
}
