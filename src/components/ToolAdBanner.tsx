import AdBox from "./AdBox";

export default function ToolAdBanner() {
  return (
    <div className="flex min-[1600px]:hidden justify-center mb-4 w-full min-h-[250px]">
      <AdBox adFormat="horizontal" height={250} label="300x250 AD" className="w-full max-w-[400px]" />
    </div>
  );
}
