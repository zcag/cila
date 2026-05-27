// nav.ts — the single source of nav truth, consumed by BOTH the sidebar and the
// ⌘K command palette (so the accelerator never drifts from real navigation —
// the palette is a fast path TO nav, never the only path).
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  // a couple of items are intentionally unbuilt routes — they exist to show the
  // shell's full nav surface; clicking them lands on a generic page.
  ready?: boolean;
};

export const primaryNav: NavItem[] = [
  { title: "Overview", href: "/", icon: LayoutDashboard, ready: true },
  { title: "Projects", href: "/projects", icon: FolderKanban, ready: true },
  { title: "Clients", href: "/clients", icon: Users },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];
