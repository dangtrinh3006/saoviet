/** Renders the markdown-lite body: blank-line paragraphs, "## " headings, "**bold**". */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export function RichText({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-6 text-[1.05rem] leading-[1.85] text-ink-muted md:text-lg">
      {blocks.map((b, i) =>
        b.startsWith("## ") ? (
          <h2 key={i} className="display pt-6 text-3xl text-ink md:text-4xl">
            {b.slice(3)}
          </h2>
        ) : (
          <p key={i} className={i === 0 ? "text-ink first-letter:float-left first-letter:mr-3 first-letter:font-[family-name:var(--font-display)] first-letter:text-7xl first-letter:leading-[0.8] first-letter:text-accent" : undefined}>
            {inline(b)}
          </p>
        ),
      )}
    </div>
  );
}
