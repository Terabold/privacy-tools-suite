const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../src/pages/Index.tsx');
let content = fs.readFileSync(indexPath, 'utf8');

// 1. Update Hero
content = content.replace(
  /<motion\.h1[^>]*>.*?<\/motion\.h1>/s,
  `<motion.h1 variants={revealItem} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-foreground font-display mb-4 leading-[0.9]">
              Free tools that never <span className="text-primary italic">see your files.</span>
            </motion.h1>`
);

content = content.replace(
  /<motion\.p[^>]*>.*?<\/motion\.p>/s,
  `<motion.p variants={revealItem} className="mx-auto max-w-xl text-sm md:text-base text-muted-foreground leading-relaxed font-medium mt-4">
               Hardware-accelerated tools running 100% locally. No servers. No logs.
            </motion.p>`
);

// 2. Remove "Quick Escalation Hub"
content = content.replace(/<section id="platform-hub".*?<\/section>/s, '');

// 3. Remove "High-Authority Text Anchor"
content = content.replace(/<section id="authority-anchor".*?<\/section>/s, '');

// 4. Remove Privacy Manifesto and Benefits
content = content.replace(/<motion\.section\s+id="privacy-manifesto".*?<\/motion\.section>/s, '');
content = content.replace(/<motion\.section\s+id="benefits".*?<\/motion\.section>/s, '');

// 5. Add new Trust Signals
const trustSignals = `
          {/* New Trust Signals */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 mb-16">
            <div className="flex flex-col items-center text-center p-8 studio-gradient rounded-3xl border border-primary/10 shadow-lg">
              <ShieldCheck className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-black mb-3 tracking-tight">Your files never leave your device. Ever.</h3>
              <p className="text-muted-foreground text-sm font-medium">Everything runs entirely in your browser.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 studio-gradient rounded-3xl border border-primary/10 shadow-lg">
              <Lock className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-black mb-3 tracking-tight">No account. No signup. Just open and use.</h3>
              <p className="text-muted-foreground text-sm font-medium">We don't collect emails or personal data.</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 studio-gradient rounded-3xl border border-primary/10 shadow-lg">
              <Zap className="h-12 w-12 text-primary mb-6" />
              <h3 className="text-xl font-black mb-3 tracking-tight">Works offline once the page loads.</h3>
              <p className="text-muted-foreground text-sm font-medium">Air-gapped security for sensitive tasks.</p>
            </div>
          </section>
`;

// Insert the Trust Signals where the Integrated Ad Break ends
content = content.replace(
  /(\{\/\*\s*Integrated Ad Break\s*\*\/.*?<\/div>\s*)/s,
  `$1\n${trustSignals}`
);

// 6. Inject Search Bar and Recently Used above ToolsGrid
// First, import useRecentTools and Input, Search
if (!content.includes('useRecentTools')) {
  content = content.replace(
    /import ToolsGrid/s,
    `import { useRecentTools } from "@/hooks/useRecentTools";\nimport { Input } from "@/components/ui/input";\nimport { Search } from "lucide-react";\nimport ToolCard from "@/components/ToolCard";\nimport ToolsGrid`
  );
}

// Add hooks to Index component
content = content.replace(
  /const Index = \(\{.*?\}: IndexProps\) => \{/s,
  (match) => `${match}\n  const { recentTools } = useRecentTools();\n  const recentToolsData = useMemo(() => recentTools.map(r => tools.find(t => t.to === r)).filter(Boolean), [recentTools]);`
);

// Build Search and Recent UI
const searchAndRecentUI = `
             {/* Search Bar */}
             <div className="relative group w-full max-w-2xl mx-auto mb-10">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="premium-control h-16 w-full pl-16 pr-10 text-lg font-semibold rounded-2xl shadow-xl shadow-black/5"
                />
             </div>

             {/* Recently Used */}
             {recentToolsData.length > 0 && !searchQuery && !selectedCategory && (
               <div className="mb-16">
                 <h2 className="text-xl font-black tracking-tighter uppercase italic mb-6 pl-2">Recently Used</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                   {recentToolsData.map((tool: any) => (
                     <div key={tool.to} className="h-[200px]">
                       <ToolCard {...tool} />
                     </div>
                   ))}
                 </div>
               </div>
             )}
`;

content = content.replace(
  /<ToolsGrid/s,
  `${searchAndRecentUI}\n              <ToolsGrid`
);

// Fix "All Artifacts" -> "All Tools"
content = content.replace(/All Artifacts/g, 'All Tools');

fs.writeFileSync(indexPath, content);
console.log("Updated Index.tsx successfully.");
