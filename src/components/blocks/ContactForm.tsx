"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// UI-SPEC §9 Form column / D-07: client-side-only stub. `onSubmit` sets a
// local success UI state ONLY — no fetch/server action/route handler exists
// yet. Phase 4 (LEAD) swaps this handler for a real Server Action against
// the SAME contactSchema; no other change needed here.
// ponytail: no honeypot/spam field yet — intended insertion point is right
// below the `message` field; spam defense is explicit Phase 4/LEAD-03 scope
// (UI-SPEC ContactBlock note), not built now.
export function ContactForm() {
  const t = useTranslations("contact");
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", company: "", country: "", message: "" },
  });

  function onSubmit() {
    // D-07: no network call — local UI state only.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-md bg-primary-100 p-lg text-body" role="status">
        {t("successMessage")}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-md">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("companyLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("countryLabel")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("messageLabel")}</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Spam-defense insertion point (Phase 4/LEAD-03): honeypot field
            goes here, before the submit button — not built yet (D-07). */}
        <Button type="submit" className="justify-self-start">
          {t("submit")}
        </Button>
      </form>
    </Form>
  );
}
