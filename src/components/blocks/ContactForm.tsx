"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { contactSchema, type ContactFormValues } from "@/lib/contact-schema";
import { submitContactForm } from "@/lib/contact-action";
import { trackEvent } from "@/lib/analytics";
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

// UI-SPEC §9 Form column: form's first real async call. `status` replaces
// Phase 2's boolean `submitted` flag with the full idle/loading/success/
// error/rate-limited cycle the Server Action (04-02) now supports.
type Status = "idle" | "loading" | "success" | "error" | "rate-limited";

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      company: "",
      country: "",
      email: "",
      phone: "",
      message: "",
      companyWebsite: "",
      turnstileToken: "",
    },
  });

  // Reactive read so the submit button re-enables the instant the widget
  // resolves, without a second piece of state duplicating RHF's own store.
  const turnstileToken = form.watch("turnstileToken");
  const isLoading = status === "loading";

  async function onSubmit(values: ContactFormValues) {
    setStatus("loading");
    try {
      const result = await submitContactForm(values);
      if (result.status === "success") {
        setStatus("success");
        // ponytail: RFQ mode (values.product) is wired here but not yet
        // populated — 04-04 adds the hidden `product` field bound to the
        // `?product=` query param, at which point this branch starts firing
        // rfq_submit for real. Only the product slug is ever passed (T-04-06).
        trackEvent(values.product ? "rfq_submit" : "inquiry_submit", {
          product: values.product ?? "",
        });
        return;
      }
      setStatus(result.message === "rate-limited" ? "rate-limited" : "error");
    } catch {
      // The Server Action call itself is a network request (LEAD-04) — a
      // dropped connection throws here rather than resolving to the typed
      // error result above; treat it the same as a generic send failure.
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-md bg-primary-100 p-lg text-body" role="status">
        {t("successMessage")}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-md">
        {(status === "error" || status === "rate-limited") && (
          <div className="rounded-md border border-destructive bg-destructive/10 p-md text-body text-destructive">
            {status === "rate-limited" ? t("rateLimitBanner") : t("errorBanner")}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("nameLabel")}</FormLabel>
              <FormControl>
                <Input {...field} readOnly={isLoading} />
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
                <Input {...field} readOnly={isLoading} />
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
                <Input {...field} readOnly={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* D-01: email/phone are each individually optional — the combined
            "provide at least one" rule lives in contactSchema's top-level
            .refine() (path: ["phone"]), so its error renders here via the
            Phone field's own FormMessage, not a second manual check. */}
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("emailLabel")}</FormLabel>
                <FormControl>
                  <Input type="email" {...field} readOnly={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phoneLabel")}</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} readOnly={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("messageLabel")}</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} readOnly={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* LEAD-03 honeypot: always rendered, always empty for real users.
            Tailwind's `sr-only` clip-hides (not display:none/visibility:
            hidden, which some bots specifically skip) without an offscreen
            physical `left` offset — UI-SPEC's literal "-left-[9999px]"
            pushes the element outside the RTL document's scrollable area
            and reintroduces horizontal overflow under dir=rtl (caught by
            responsive-rtl.spec.ts / contact.spec.ts's overflow assertion);
            `sr-only` gets the identical "present in the DOM, invisible,
            unreachable by tab" result via clip + 1px box, no offset. */}
        <FormField
          control={form.control}
          name="companyWebsite"
          render={({ field }) => (
            <FormItem className="sr-only">
              <FormLabel>Company Website</FormLabel>
              <FormControl>
                <Input {...field} aria-hidden="true" tabIndex={-1} autoComplete="off" />
              </FormControl>
            </FormItem>
          )}
        />
        {/* LEAD-03: Cloudflare Turnstile. onSuccess writes the token the
            Server Action verifies server-side; submit stays disabled until
            it's populated. onError/script-load failure both surface the
            generic error banner (WhatsApp/email fallback copy already
            covers "widget broke" — backstop truth) rather than leaving a
            silently-dead submit button. */}
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""}
          onSuccess={(token) => form.setValue("turnstileToken", token)}
          onExpire={() => form.setValue("turnstileToken", "")}
          onError={() => {
            form.setValue("turnstileToken", "");
            setStatus("error");
          }}
          scriptOptions={{ onError: () => setStatus("error") }}
        />
        <Button
          type="submit"
          disabled={isLoading || !turnstileToken}
          className="justify-self-start"
        >
          {isLoading ? (
            <>
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              {t("loadingSubmit")}
            </>
          ) : (
            t("submit")
          )}
        </Button>
      </form>
    </Form>
  );
}
