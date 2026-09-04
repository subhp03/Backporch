export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh bg-black">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:w-1/2 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="hidden bg-zinc-950 sm:block sm:w-1/2" />
    </div>
  );
}
