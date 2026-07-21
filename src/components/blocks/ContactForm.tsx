"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// UI-SPEC §9 Form column: form's first real async call. `status` replaces
// Phase 2's boolean `submitted` flag with the full idle/loading/success/
// error/rate-limited cycle the Server Action (04-02) now supports.
type Status = "idle" | "loading" | "success" | "error" | "rate-limited";

// D-02 field-level detail: 11 Incoterms 2020 codes, each rendered
// "CODE (Full Name)". The "Not sure yet" option is a real selectable
// SelectItem (below), not this list.
const INCOTERMS: ReadonlyArray<readonly [code: string, name: string]> = [
  ["EXW", "Ex Works"],
  ["FCA", "Free Carrier"],
  ["CPT", "Carriage Paid To"],
  ["CIP", "Carriage and Insurance Paid To"],
  ["DAP", "Delivered at Place"],
  ["DPU", "Delivered at Place Unloaded"],
  ["DDP", "Delivered Duty Paid"],
  ["FAS", "Free Alongside Ship"],
  ["FOB", "Free on Board"],
  ["CFR", "Cost and Freight"],
  ["CIF", "Cost, Insurance and Freight"],
];

export function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  // D-02/D-03: RFQ mode is derived client-side from the `product` query
  // param (never a re-pickable dropdown). `productName` is a display-only
  // hint from the linking page; when it's missing/empty the banner falls
  // back to the raw slug (UI-SPEC backstop truth).
  const searchParams = useSearchParams();
  const product = searchParams.get("product") ?? "";
  const productNameParam = searchParams.get("productName") ?? "";
  const isRfqMode = product.length > 0;
  const productLabel = productNameParam || product;

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
      product,
      productName: productNameParam,
      quantity: "",
      destinationCountry: "",
      incoterm: "",
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
        // T-04-06: only the product slug is ever passed as an analytics
        // param — never quantity/destination/incoterm/PII.
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
        {isRfqMode ? t("successRfq", { productName: productLabel }) : t("successMessage")}
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
        {isRfqMode && (
          <>
            {/* D-03: read-only, presentation-only banner — product identity
                submits via the hidden registered inputs below, never an
                editable/re-pickable control. */}
            <div className="rounded-md bg-primary-100 px-md py-sm text-body">
              {t.rich("productBanner", {
                productName: productLabel,
                b: (chunks) => <span className="font-semibold">{chunks}</span>,
              })}
            </div>
            <input type="hidden" {...form.register("product")} />
            <input type="hidden" {...form.register("productName")} />
          </>
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
        {isRfqMode && (
          <>
            <p className="mt-sm text-label font-semibold">{t("quoteDetails")}</p>
            <div className="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("quantityLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={isLoading} />
                    </FormControl>
                    <p className="text-label text-neutral-600">{t("quantityHelper")}</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destinationCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("destinationCountryLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="incoterm"
                render={({ field }) => {
                  const selected = INCOTERMS.find(([code]) => code === field.value);
                  return (
                    <FormItem>
                      <FormLabel>{t("incotermLabel")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            {/* RTL Extensions: the rendered code is wrapped
                                in <bdi> so it doesn't reverse under RTL. */}
                            <SelectValue placeholder={t("incotermNotSure")}>
                              {selected ? (
                                <>
                                  <bdi>{selected[0]}</bdi> ({selected[1]})
                                </>
                              ) : field.value === "not-sure" ? (
                                t("incotermNotSure")
                              ) : undefined}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not-sure">{t("incotermNotSure")}</SelectItem>
                          {INCOTERMS.map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              <bdi>{code}</bdi> ({name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </>
        )}
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
          ) : isRfqMode ? (
            t("submitRfq")
          ) : (
            t("submit")
          )}
        </Button>
      </form>
    </Form>
  );
}
