import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/chrome/LanguageSwitcher";
import { BrandMark } from "@/components/chrome/BrandMark";
import { resolveSocialLinks } from "@/components/chrome/social-links";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { LinkedInIcon } from "@/components/icons/LinkedInIcon";

// UI-SPEC Component Inventory — GlobalFooter: primary-900 surface, white/
// neutral-100 text, gold hover-underline links. 3-column layout (brand /
// useful links / contact information) — single column mobile, logical row
// desktop. Footer is the comprehensive discovery surface — it carries every
// page, including the secondary ones trimmed from the primary header nav
// (Insights, Manufacturing, Company) so nothing is orphaned on desktop.
const NAV_KEYS = [
  "home",
  "about",
  "products",
  "certifications",
  "manufacturing",
  "export",
  "company",
  "insights",
  "contact",
] as const;

const NAV_HREFS: Record<(typeof NAV_KEYS)[number], string> = {
  home: "/",
  about: "/about",
  products: "/products",
  certifications: "/certifications",
  manufacturing: "/manufacturing",
  export: "/export",
  company: "/company",
  insights: "/insights",
  contact: "/contact",
};

type FooterAddress = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

function formatAddress(address?: FooterAddress): string | null {
  if (!address) return null;
  const parts = [address.street, address.city, address.state, address.postalCode, address.country].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

type LegalIdentity = { cin?: string; gst?: string; iec?: string; fssai?: string };

// T-102/COMPONENT_LIBRARY C-03: only the fields the owner has actually
// supplied render — no "CIN: — " placeholder wall for numbers that don't
// exist yet (CONTENT_PLAYBOOK §6: unresolved facts are cut, not faked).
function formatLegalIdentity(legal?: LegalIdentity): string | null {
  if (!legal) return null;
  const parts = [
    legal.cin ? `CIN ${legal.cin}` : null,
    legal.gst ? `GST ${legal.gst}` : null,
    legal.iec ? `IEC ${legal.iec}` : null,
    legal.fssai ? `FSSAI ${legal.fssai}` : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export async function GlobalFooter({
  siteName,
  logoUrl,
  sameAs,
  email,
  phone,
  address,
  factoryAddress,
  legalIdentity,
}: {
  siteName: string;
  logoUrl: string | null;
  sameAs: string[];
  email: string;
  phone: string;
  address?: FooterAddress;
  factoryAddress?: FooterAddress & { facilityName?: string };
  legalIdentity?: LegalIdentity;
}) {
  const t = await getTranslations("nav");
  const tf = await getTranslations("footer");
  const year = new Date().getFullYear();
  const socials = resolveSocialLinks(sameAs);
  const formattedAddress = formatAddress(address);
  const formattedFactoryAddress = formatAddress(factoryAddress);
  const formattedLegalIdentity = formatLegalIdentity(legalIdentity);

  return (
    <footer className="bg-primary-900 px-md py-xl text-neutral-100 md:px-lg md:py-2xl xl:px-xl">
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-lg md:grid-cols-3 md:gap-lg">
        <div className="flex flex-col gap-md">
          <Link href="/" className="w-fit">
            <BrandMark siteName={siteName} logoUrl={logoUrl} variant="dark" />
          </Link>
          {socials.length > 0 ? (
            <div className="flex gap-sm">
              {socials.map((s) => (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-neutral-100 hover:text-accent-600"
                >
                  {s.platform === "instagram" ? (
                    <InstagramIcon className="h-5 w-5" />
                  ) : (
                    <LinkedInIcon className="h-5 w-5" />
                  )}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-sm">
          <h2 className="text-body font-semibold text-white">{tf("usefulLinks")}</h2>
          <nav className="grid grid-cols-2 gap-x-md gap-y-xs text-label" aria-label="Footer">
            {NAV_KEYS.map((key) => (
              <Link
                key={key}
                href={NAV_HREFS[key]}
                className="w-fit text-neutral-100 underline-offset-4 hover:text-accent-600 hover:underline"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-sm">
          <h2 className="text-body font-semibold text-white">{tf("contactInformation")}</h2>
          <ul className="flex flex-col gap-xs text-label">
            {formattedAddress ? (
              <li className="flex items-start gap-sm">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-600" />
                <span>
                  <span className="block font-semibold text-white">{tf("corporateOffice")}</span>
                  {formattedAddress}
                </span>
              </li>
            ) : null}
            {formattedFactoryAddress ? (
              <li className="flex items-start gap-sm">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-600" />
                <span>
                  <span className="block font-semibold text-white">{tf("factory")}</span>
                  {factoryAddress?.facilityName ? `${factoryAddress.facilityName}, ` : ""}
                  {formattedFactoryAddress}
                </span>
              </li>
            ) : null}
            <li className="flex items-center gap-sm">
              <Mail aria-hidden="true" className="size-4 shrink-0 text-accent-600" />
              <a href={`mailto:${email}`} className="hover:text-accent-600 hover:underline">
                {email}
              </a>
            </li>
            <li className="flex items-center gap-sm">
              <Phone aria-hidden="true" className="size-4 shrink-0 text-accent-600" />
              <a href={`tel:${phone}`} className="hover:text-accent-600 hover:underline">
                {phone}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-lg flex w-full max-w-[1280px] flex-col-reverse items-start gap-md border-t border-white/10 pt-md sm:flex-row sm:items-center sm:justify-between">
        <p className="text-label text-neutral-300">{`© ${year} ${siteName}. All rights reserved.`}</p>
        <LanguageSwitcher onDark />
      </div>
      {formattedLegalIdentity ? (
        <p className="mx-auto mt-sm w-full max-w-[1280px] text-label text-neutral-300">
          {formattedLegalIdentity}
        </p>
      ) : null}
    </footer>
  );
}
