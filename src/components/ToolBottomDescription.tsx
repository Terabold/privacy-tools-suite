import React from 'react';
import toolsMetadata from '@/data/toolsMetadata.json';
import AdBox from '@/components/AdBox';
import { HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface ToolBottomDescriptionProps {
  toolId: string;
}

const ToolBottomDescription: React.FC<ToolBottomDescriptionProps> = ({ toolId }) => {
  const meta = toolsMetadata.find(m => m.to === toolId);
  
  if (!meta) return null;

  const title = meta.seoTitle.split(' - ')[0] || 'Private Tool';
  const h1Text = `${title} — Free, Private, No Upload`;
  const description = meta.seoDescription;

  // JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": title,
    "operatingSystem": "Any",
    "applicationCategory": "BrowserApplication",
    "description": description,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is this tool safe to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. This tool processes everything locally in your browser. Your files never leave your device."
        }
      },
      {
        "@type": "Question",
        "name": "Does it work offline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. Once the page is loaded, you can disconnect from the internet and the tool will continue to work perfectly."
        }
      },
      {
        "@type": "Question",
        "name": "Are there any file size limits?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The only limit is your device's available RAM. Since there are no uploads, you bypass standard server restrictions."
        }
      }
    ]
  };

  return (
    <div className="mt-16 max-w-4xl mx-auto space-y-12">
            <Helmet>
        <title>{title} — Free, Private, No Upload | PrivateUtils</title>
        <meta name="description" content={description} />
        
        <meta property="og:title" content={`${title} | PrivateUtils`} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content="https://www.privateutils.com/og-default.png" />
        
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Unobtrusive Ad Slot Placeholder */}
      <div className="w-full flex justify-center my-10">
        <AdBox adFormat="horizontal" height={90} label="728x90 AD SLOT" className="w-full max-w-[728px]" />
      </div>

      <section className="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground space-y-6 text-lg leading-relaxed bg-muted/20 p-8 rounded-3xl border border-primary/5">
        <header className="space-y-4 mb-8">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground font-display leading-tight italic text-shadow-glow">
            {h1Text}
          </h1>
          <div className="h-1.5 w-24 bg-primary rounded-full" />
        </header>

        <p className="text-xl font-medium text-foreground">
          {description}
        </p>
      </section>

      {/* FAQ Section */}
      <section className="bg-primary/5 border border-primary/10 rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h2 className="text-2xl font-black uppercase tracking-widest font-display text-foreground">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">Is this tool safe to use?</h3>
            <p className="text-muted-foreground">Yes. This tool processes everything locally in your browser. Your files never leave your device, ensuring complete privacy.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">Does it work offline?</h3>
            <p className="text-muted-foreground">Yes. Once the page is loaded, you can disconnect from the internet and the tool will continue to function perfectly using your local hardware.</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-foreground">Are there any file size limits?</h3>
            <p className="text-muted-foreground">The only limit is your device's available RAM. Since there are no uploads, you bypass the standard server restrictions found on other websites.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToolBottomDescription;
