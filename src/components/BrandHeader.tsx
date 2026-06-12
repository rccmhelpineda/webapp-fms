import { withBasePath } from "@/lib/base-path";

export function BrandHeader() {
  return (
    <header className="flex flex-col items-center gap-2 w-full px-2">
      <img
        src={withBasePath("/RCCLogo.svg")}
        alt="RCC Globe"
        className="w-full max-w-[200px] sm:max-w-[260px] md:max-w-[300px] h-auto object-contain"
      />
    </header>
  );
}
