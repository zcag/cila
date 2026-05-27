// data.ts — the demo domain. This starter models a fictional "Projects" object
// (the object-oriented IA default for B2B tools). In a real app this is your
// API/DB layer; here it's a seeded in-memory list so every screen has believable
// content (the build writes real-feeling copy, never lorem).

export type ProjectStatus = "active" | "paused" | "archived";

export type Project = {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number; // 0–100
  budget: number; // USD
  owner: { name: string; initials: string };
  updatedAt: string; // ISO date
};

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Active",
  paused: "Paused",
  archived: "Archived",
};

// Sample rows. Names are human-readable (the table's first-column rule).
export const projects: Project[] = [
  {
    id: "PRJ-1042",
    name: "Aurora design system",
    client: "Northwind Labs",
    status: "active",
    progress: 72,
    budget: 48000,
    owner: { name: "Mara Velez", initials: "MV" },
    updatedAt: "2026-05-26",
  },
  {
    id: "PRJ-1039",
    name: "Checkout funnel rebuild",
    client: "Brightside Retail",
    status: "active",
    progress: 41,
    budget: 96000,
    owner: { name: "Theo Park", initials: "TP" },
    updatedAt: "2026-05-25",
  },
  {
    id: "PRJ-1031",
    name: "Mobile onboarding flow",
    client: "Cadence Health",
    status: "paused",
    progress: 18,
    budget: 30500,
    owner: { name: "Ines Cole", initials: "IC" },
    updatedAt: "2026-05-21",
  },
  {
    id: "PRJ-1028",
    name: "Billing portal migration",
    client: "Helios Energy",
    status: "active",
    progress: 88,
    budget: 124000,
    owner: { name: "Sam Okafor", initials: "SO" },
    updatedAt: "2026-05-20",
  },
  {
    id: "PRJ-1019",
    name: "Q2 marketing site",
    client: "Northwind Labs",
    status: "archived",
    progress: 100,
    budget: 22000,
    owner: { name: "Mara Velez", initials: "MV" },
    updatedAt: "2026-04-30",
  },
  {
    id: "PRJ-1014",
    name: "Internal analytics dashboard",
    client: "Helios Energy",
    status: "active",
    progress: 56,
    budget: 67500,
    owner: { name: "Theo Park", initials: "TP" },
    updatedAt: "2026-05-18",
  },
  {
    id: "PRJ-1008",
    name: "Support knowledge base",
    client: "Cadence Health",
    status: "paused",
    progress: 33,
    budget: 14000,
    owner: { name: "Ines Cole", initials: "IC" },
    updatedAt: "2026-05-12",
  },
];

export const usdCompact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
