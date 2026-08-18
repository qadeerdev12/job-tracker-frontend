// Shared shell for every profile section so headings, spacing and the card
// treatment stay identical down the page.
export default function ProfileSection({ title, description, children, action }) {
  return (
    <section className="bg-card rounded-2xl border border-line p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-heading">{title}</h3>
          {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
