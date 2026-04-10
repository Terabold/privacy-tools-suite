import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import toolsMetadata from "@/data/toolsMetadata.json";

const BASE_URL = "https://privateutils.com";

const HOME_META = {
  title: "PrivateUtils — Private Browser Tools",
  description:
    "Simple browser tools for media and code. 100% private, no uploads. Everything runs locally on your device.",
};

/**
 * SEOHead — A zero-dependency, null-render component that imperatively
 * manages <title>, <meta name="description">, <link rel="canonical">,
 * and a JSON-LD SoftwareApplication schema tag on every route change.
 *
 * Design decision: we use direct DOM mutation (same pattern as ScrollToTop)
 * rather than react-helmet-async to avoid hydration complexity in this SPA.
 * The prerender script already bakes these tags into static HTML; at runtime
 * this component keeps them correct after client-side navigation.
 */
const SEOHead = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath =
      pathname === "/" ? "/" : pathname.replace(/\/$/, "");

    // 1. Resolve metadata for this route
    const meta: any =
      normalizedPath === "/"
        ? HOME_META
        : toolsMetadata.find((m) => m.to === normalizedPath);

    const title = meta?.title ?? meta?.seoTitle ?? HOME_META.title;
    const description =
      meta?.description ?? meta?.seoDescription ?? HOME_META.description;
    const canonical = `${BASE_URL}${normalizedPath}`;

    // 2. Update <title>
    document.title = title;

    // 3. Upsert <meta name="description">
    let descTag = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );
    if (!descTag) {
      descTag = document.createElement("meta");
      descTag.name = "description";
      document.head.appendChild(descTag);
    }
    descTag.content = description;

    // 4. Upsert <link rel="canonical">
    let canonicalTag = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonicalTag) {
      canonicalTag = document.createElement("link");
      canonicalTag.rel = "canonical";
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = canonical;

    // 5. Upsert JSON-LD SoftwareApplication schema
    const schemaId = "jsonld-software-app";
    let schemaTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schemaTag) {
      schemaTag = document.createElement("script");
      schemaTag.id = schemaId;
      schemaTag.type = "application/ld+json";
      document.head.appendChild(schemaTag);
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: title,
      description,
      url: canonical,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web Browser",
      browserRequirements: "Requires a modern browser with JavaScript enabled",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "100% client-side processing — zero server uploads",
        "Air-gapped privacy by design",
        "No account required",
        "WebAssembly-accelerated processing",
      ],
      provider: {
        "@type": "Organization",
        name: "PrivateUtils",
        url: BASE_URL,
      },
    };

    schemaTag.textContent = JSON.stringify(schema);
  }, [pathname]);

  // Null-render — this component is purely a DOM side-effect manager
  return null;
};

export default SEOHead;
