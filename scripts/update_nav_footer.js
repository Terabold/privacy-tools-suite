const fs = require('fs');
const path = require('path');

// --- Navbar.tsx ---
const navbarPath = path.join(__dirname, '../src/components/Navbar.tsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// 1. Make Dev/Code Hub visible on desktop
navbarContent = navbarContent.replace(/<div className="lg:hidden flex items-center gap-1\.5">/g, '<div className="flex items-center gap-1.5">');

// 2. Remove Ko-fi button
navbarContent = navbarContent.replace(/<a\s+href="https:\/\/ko-fi\.com\/privateutils".*?<\/a>/s, '');

fs.writeFileSync(navbarPath, navbarContent);
console.log("Updated Navbar.tsx successfully.");


// --- Footer.tsx ---
const footerPath = path.join(__dirname, '../src/components/Footer.tsx');
let footerContent = fs.readFileSync(footerPath, 'utf8');

// 1. Remove v1.0 badge
footerContent = footerContent.replace(/<span className="text-\[10px\] bg-primary\/10 text-primary px-2 py-0\.5 rounded-full font-black tracking-widest uppercase">\s*v1\.0\s*<\/span>/, '');

// 2. Remove "Quick Escalation Hub"
// Wait, the "Quick Escalation Hub" was in Index.tsx, which I already removed.
// Does Footer have it? Let's check if it has "Engineering Insights"
footerContent = footerContent.replace(/Engineering Insights/g, 'Blog');

fs.writeFileSync(footerPath, footerContent);
console.log("Updated Footer.tsx successfully.");
