const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, '../src/data/toolsMetadata.json');
const toolsMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

const DOMAIN = "https://www.privateutils.com";

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

// Homepage
sitemap += `
  <url>
    <loc>${DOMAIN}/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>`;

// Tool Pages
toolsMetadata.forEach(tool => {
  sitemap += `
  <url>
    <loc>${DOMAIN}${tool.to}</loc>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
  </url>`;
});

// Basic Pages
const basicPages = ['/about', '/faq', '/contact'];
basicPages.forEach(page => {
  sitemap += `
  <url>
    <loc>${DOMAIN}${page}</loc>
    <priority>0.3</priority>
    <changefreq>yearly</changefreq>
  </url>`;
});

sitemap += `\n</urlset>`;

// Write sitemap
fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log("Generated sitemap.xml");

// Write robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, '../public/robots.txt'), robotsTxt);
console.log("Generated robots.txt");
