import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import toolsMetadata from "@/data/toolsMetadata.json";

const BASE_URL = "https://privateutils.com";

const HOME_META = {
  title: "PrivateUtils — Free Private Browser Tools, No Upload Required",
  description:
    "A professional collection of client-side developer and media tools. Process video, images, and sensitive data entirely in your browser. No server uploads, no tracking, 100% private.",
};

/**
 * SEOHead — Manages <head>, <meta>, <link rel="canonical">,
 * and JSON-LD SoftwareApplication schema across routes.
 * 
 * Uses react-helmet-async for robust metadata management and
 * to ensure correct hydration/rendering for crawlers.
 */
const SEOHead = () => {
  const { pathname } = useLocation();

  // Normalize path: handle home and remove trailing slash for consistency
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
  const canonical = `${BASE_URL}${normalizedPath}`;

  // Resolve metadata
  const meta: any =
    normalizedPath === "/"
      ? HOME_META
      : toolsMetadata.find((m: any) => m.to === normalizedPath);

    const noIndexPages = [
    "/about", "/insights", "/faq", "/contact", 
    "/technical-architecture", "/security-architecture"
  ];
  const shouldNoIndex = noIndexPages.includes(normalizedPath);

  const title = meta?.title ?? meta?.seoTitle ?? HOME_META.title;
  const description =
    meta?.description ?? meta?.seoDescription ?? HOME_META.description;

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
      logo: `${BASE_URL}/apple-touch-icon.png`
    },
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      {shouldNoIndex && <meta name="robots" content="noindex, follow" />}
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${BASE_URL}/og-image.png`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}/og-image.png`} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default SEOHead;

