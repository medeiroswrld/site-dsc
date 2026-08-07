/** Renders a structured-data block. Server component — no hydration cost. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is built from typed, in-repo values only.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
