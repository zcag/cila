// projects/page.tsx — the Projects object list. The page is a server component
// (title + the primary "New project" action); the interactive table + its state
// switcher are a client island below.
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { ProjectsView } from "@/components/projects/projects-view";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        title="Projects"
        description="Every piece of client work, sortable and filterable. Select rows for bulk actions."
        actions={
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="size-4" />
              New project
            </Link>
          </Button>
        }
      />
      <ProjectsView />
    </>
  );
}
