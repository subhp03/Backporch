import { Geist_Pixel } from "next/font/google";

const geistPixel = Geist_Pixel({
  variable: "--font-pixel",
  subsets: ["latin"],
});

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={`${geistPixel.variable} min-h-dvh bg-black text-zinc-100`}>
      {children}
    </div>
  );
}
