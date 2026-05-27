// projects/new/page.tsx — the create form route. Server component for the
// chrome (back link + title); the form itself is the client island.
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/shell/page-header";
import { ProjectForm } from "@/components/projects/project-form";

export const metadata: Metadata = { title: "New project" };

export default function NewProjectPage() {
  return (
    <>
      <Link
        href="/projects"
        className="mb-4 -ml-1 inline-flex items-center gap-1 rounded-sm px-1 py-1 text-sm text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Projects
      </Link>
      <PageHeader
        title="New project"
        description="Fill in the essentials. You can refine everything after it's created."
      />
      <ProjectForm />
    </>
  );
}
