export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
