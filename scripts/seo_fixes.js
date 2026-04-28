const fs = require('fs');
const path = require('path');

// 1. Update ToolBottomDescription.tsx
const toolBottomPath = path.join(__dirname, '../src/components/ToolBottomDescription.tsx');
let toolContent = fs.readFileSync(toolBottomPath, 'utf8');

const newHelmetContent = `      <Helmet>
        <title>{title} — Free, Private, No Upload | PrivateUtils</title>
        <meta name="description" content={description} />
        
        <meta property="og:title" content={\`\${title} | PrivateUtils\`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://www.privateutils.com/og-default.png" />
        
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>`;

toolContent = toolContent.replace(/<Helmet>[\s\S]*?<\/Helmet>/, newHelmetContent);
fs.writeFileSync(toolBottomPath, toolContent);
console.log("Updated ToolBottomDescription.tsx");

// 2. Update SEOHead.tsx
const seoHeadPath = path.join(__dirname, '../src/components/SEOHead.tsx');
let seoContent = fs.readFileSync(seoHeadPath, 'utf8');

const newHomeMeta = `const HOME_META = {
  title: "PrivateUtils — Free Private Browser Tools, No Upload Required",
  description:
    "A professional collection of client-side developer and media tools. Process video, images, and sensitive data entirely in your browser. No server uploads, no tracking, 100% private.",
};`;
seoContent = seoContent.replace(/const HOME_META = \{[\s\S]*?\};/, newHomeMeta);

// Add NoIndex logic
const noIndexLogic = `  const noIndexPages = [
    "/about", "/insights", "/faq", "/contact", 
    "/technical-architecture", "/security-architecture"
  ];
  const shouldNoIndex = noIndexPages.includes(normalizedPath);
`;
seoContent = seoContent.replace(/const title =/, noIndexLogic + '\n  const title =');

const robotsMeta = `{shouldNoIndex && <meta name="robots" content="noindex, follow" />}`;
seoContent = seoContent.replace(/<title>{title}<\/title>/, `<title>{title}</title>\n      ${robotsMeta}`);

// Fix JSON-LD logo url
seoContent = seoContent.replace(
  /provider: \{\s*"@type": "Organization",\s*name: "PrivateUtils",\s*url: BASE_URL,?\s*\}/,
  `provider: {
      "@type": "Organization",
      name: "PrivateUtils",
      url: BASE_URL,
      logo: \`\${BASE_URL}/apple-touch-icon.png\`
    }`
);

fs.writeFileSync(seoHeadPath, seoContent);
console.log("Updated SEOHead.tsx");

// Update index.html title
const htmlPath = path.join(__dirname, '../index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');
htmlContent = htmlContent.replace(/<title>.*?<\/title>/, '<title>PrivateUtils — Free Private Browser Tools, No Upload Required</title>');
fs.writeFileSync(htmlPath, htmlContent);
console.log("Updated index.html");
