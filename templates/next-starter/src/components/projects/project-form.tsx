// project-form.tsx — the create/edit form. Single-column, labels-above, correct
// input types, INLINE-ON-BLUR validation, and an ALWAYS-ENABLED submit (we
// validate on submit and focus the first error rather than disabling the
// button — per the research, disabled submits are a dark pattern).
//
//   • react-hook-form `mode: "onBlur"`  → validate a field when it loses focus
//   • `reValidateMode: "onChange"`      → once errored, clear as the user fixes it
//   • zodResolver(schema)               → one schema is the validation contract
//   • shouldFocusError: true (default)  → submit focuses the first invalid field
//   • the shadcn Form layer wires label / aria-invalid / aria-describedby /
//     role=alert for every field automatically (see components/ui/form.tsx)
//   • success → a toast in the pre-existing live region + redirect (no focus theft)
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// One schema = the validation contract. Messages are human + specific +
// constructive (NN/g), not "invalid input".
const schema = z.object({
  name: z
    .string()
    .min(1, "Give the project a name.")
    .max(80, "Keep the name under 80 characters."),
  client: z.string().min(1, "Pick or type a client."),
  budget: z
    .number({ message: "Enter the budget as a number." })
    .int("Use whole dollars (no cents).")
    .positive("Budget must be greater than 0."),
  email: z
    .string()
    .min(1, "Add a contact email.")
    .email("That doesn’t look like a valid email."),
  brief: z.string().max(400, "Keep the brief under 400 characters.").optional(),
});

type FormValues = z.input<typeof schema>;

export function ProjectForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur", // inline validation on blur
    reValidateMode: "onChange", // then live-clear as they fix it
    defaultValues: { name: "", client: "", budget: undefined, email: "", brief: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    // simulate a create call
    await new Promise((r) => setTimeout(r, 700));
    setSubmitting(false);
    toast.success(`“${values.name}” created`, {
      description: "Find it at the top of the Projects list.",
    });
    router.push("/projects");
  }

  return (
    <Form {...form}>
      {/* single column, max-width reading measure for the form */}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="max-w-xl space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  autoComplete="off"
                  placeholder="e.g. Checkout funnel rebuild"
                />
              </FormControl>
              <FormDescription>A short, human name. You can rename it later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <FormControl>
                <Input {...field} type="text" autoComplete="organization" placeholder="Northwind Labs" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (USD)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : e.target.valueAsNumber,
                      )
                    }
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="50000"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact email</FormLabel>
                <FormControl>
                  {/* type=email + autocomplete + inputmode = the right keyboard
                      + browser affordances (Postel: accept, then validate) */}
                  <Input
                    {...field}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="lead@client.com"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="brief"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Brief <span className="font-normal text-fg-subtle">(optional)</span>
              </FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} placeholder="What's the goal of this project?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3 border-t border-border pt-6">
          {/* enabled submit — we validate on submit and focus the first error */}
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Creating…" : "Create project"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/projects")}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
