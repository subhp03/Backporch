export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh bg-black">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="hidden bg-zinc-950 lg:block lg:w-1/2" />
    </div>
  );
}
