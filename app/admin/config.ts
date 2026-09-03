/**
 * Collection registry driving the generic admin CRUD.
 */
export type FieldKind = "text" | "textarea" | "list" | "json" | "number" | "checkbox" | "select";

export type FieldDef = {
  name: string;
  label: string;
  kind: FieldKind;
  options?: string[];
  required?: boolean;
  rows?: number;
  sep?: string;
  help?: string;
};

export type CollectionKey = "posts" | "projects" | "services" | "team" | "jobs" | "testimonials";

export type CollectionDef = {
  label: string;
  singular: string;
  fields: FieldDef[];
  columns: string[];
  slugField: string;
  revalidate: (slug: string) => string[];
};

const jsonHelp = "Valid JSON. Arrays and objects accepted.";

export const COLLECTIONS: Record<CollectionKey, CollectionDef> = {
  posts: {
    label: "Blog Posts",
    singular: "Post",
    slugField: "slug",
    columns: ["title", "category", "date"],
    revalidate: (slug) => ["/blog", "/blog/" + slug],
    fields: [
      { name: "slug", label: "Slug", kind: "text", required: true },
      { name: "title", label: "Title", kind: "text", required: true },
      { name: "excerpt", label: "Excerpt", kind: "textarea", rows: 3, required: true },
      { name: "category", label: "Category", kind: "text", required: true },
      { name: "date", label: "Publish date (YYYY-MM-DD)", kind: "text", required: true },
      { name: "readTime", label: "Read time", kind: "text", required: true },
      { name: "author", label: "Author", kind: "text", required: true },
      { name: "authorRole", label: "Author role", kind: "text", required: true },
      { name: "cover", label: "Cover image path", kind: "text", required: true },
      { name: "published", label: "Published (visible on site)", kind: "checkbox" },
      { name: "keywords", label: "Keywords (one per line)", kind: "list", rows: 4 },
      { name: "takeaways", label: "Takeaways (one per line)", kind: "list", rows: 5 },
      { name: "quote", label: "Pull quote", kind: "textarea", rows: 2 },
      { name: "body", label: "Body paragraphs (blank line between)", kind: "list", sep: "DOUBLE_NEWLINE", rows: 12 },
      { name: "images", label: "Inline images JSON", kind: "json", rows: 4 },
      { name: "updated", label: "Updated date (optional)", kind: "text" },
      { name: "faqs", label: "FAQs JSON", kind: "json", rows: 6 },
    ],
  },  projects: {
    label: "Work / Case Studies",
    singular: "Project",
    slugField: "slug",
    columns: ["client", "industry", "result"],
    revalidate: (slug) => ["/work", "/work/" + slug],
    fields: [
      { name: "slug", label: "Slug", kind: "text", required: true },
      { name: "client", label: "Client", kind: "text", required: true },
      { name: "industry", label: "Industry", kind: "text", required: true },
      { name: "services", label: "Services (one per line)", kind: "list", rows: 3 },
      { name: "title", label: "Title", kind: "text", required: true },
      { name: "result", label: "Headline result", kind: "text", required: true },
      { name: "timeline", label: "Timeline", kind: "text", required: true },
      { name: "published", label: "Published (visible on site)", kind: "checkbox" },
      { name: "images", label: "Gallery images JSON", kind: "json", rows: 6, help: jsonHelp },
      { name: "challenge", label: "Challenge", kind: "textarea", rows: 3, required: true },
      { name: "strategy", label: "Strategy", kind: "textarea", rows: 3, required: true },
      { name: "execution", label: "Execution moves (one per line)", kind: "list", rows: 5 },
      { name: "stats", label: "Stats JSON", kind: "json", rows: 4 },
      { name: "quote", label: "Client quote", kind: "textarea", rows: 2 },
      { name: "quoteAuthor", label: "Quote author", kind: "text" },
      { name: "gradient", label: "Card gradient classes", kind: "text" },
      { name: "meta", label: "Dossier JSON (overview, obstacles, toolbox, deliverables, faqs)", kind: "json", rows: 10, help: jsonHelp },
    ],
  },  services: {
    label: "Services",
    singular: "Service",
    slugField: "slug",
    columns: ["name", "tagline"],
    revalidate: (slug) => ["/services", "/services/" + slug],
    fields: [
      { name: "slug", label: "Slug", kind: "text", required: true },
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "tagline", label: "Tagline", kind: "text", required: true },
      { name: "heroCopy", label: "Hero copy", kind: "textarea", rows: 2 },
      { name: "oneParagraph", label: "One paragraph", kind: "textarea", rows: 4 },
      { name: "situation", label: "Situation", kind: "textarea", rows: 3 },
      { name: "noise", label: "Noise", kind: "textarea", rows: 3 },
      { name: "position", label: "Position", kind: "textarea", rows: 3 },
      { name: "problem", label: "Problem", kind: "textarea", rows: 2 },
      { name: "solution", label: "Solution", kind: "textarea", rows: 2 },
      { name: "proofStat", label: "Proof stat JSON", kind: "json", rows: 2 },
      { name: "deliverables", label: "Deliverables (one per line)", kind: "list", rows: 5 },
      { name: "process", label: "Process JSON", kind: "json", rows: 6 },
      { name: "faqs", label: "FAQs JSON", kind: "json", rows: 6 },
      { name: "story", label: "Story acts JSON (optional)", kind: "json", rows: 4 },
    ],
  },  team: {
    label: "Team",
    singular: "Member",
    slugField: "name",
    columns: ["name", "role"],
    revalidate: () => ["/team", "/about", "/careers"],
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "role", label: "Role", kind: "text", required: true },
      { name: "expertise", label: "Expertise", kind: "text", required: true },
      { name: "initials", label: "Initials", kind: "text", required: true },
      { name: "sort", label: "Sort order", kind: "number" },
    ],
  },
  jobs: {
    label: "Jobs",
    singular: "Job",
    slugField: "title",
    columns: ["title", "type", "dept"],
    revalidate: () => ["/careers"],
    fields: [
      { name: "title", label: "Title", kind: "text", required: true },
      { name: "type", label: "Type", kind: "select", options: ["Full-time", "Contract"], required: true },
      { name: "location", label: "Location", kind: "text", required: true },
      { name: "dept", label: "Department", kind: "text", required: true },
      { name: "active", label: "Visible on site", kind: "checkbox" },
      { name: "detail", label: "Dossier JSON", kind: "json", rows: 10, help: jsonHelp },
    ],
  },
  testimonials: {
    label: "Testimonials",
    singular: "Testimonial",
    slugField: "company",
    columns: ["company", "author"],
    revalidate: () => ["/testimonials", "/"],
    fields: [
      { name: "quote", label: "Quote", kind: "textarea", rows: 4, required: true },
      { name: "author", label: "Author title", kind: "text", required: true },
      { name: "company", label: "Company", kind: "text", required: true },
      { name: "industry", label: "Industry", kind: "text", required: true },
      { name: "sort", label: "Sort order", kind: "number" },
    ],
  },
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS) as CollectionKey[];