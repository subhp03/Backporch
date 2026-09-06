import Image from "next/image";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh bg-black">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden bg-zinc-950 lg:block lg:w-1/2">
        <Image
          src="/authpanel.jpg"
          alt="BackPorch"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
