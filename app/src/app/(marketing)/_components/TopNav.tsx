"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";

export function TopNav() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 60], [1, 0]);

  return (
    <motion.header
      className="mx-3 mt-3 rounded-3xl bg-black text-[#fff5f5]"
      style={{ opacity }}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt=""
            width={32}
            height={32}
            className="rounded-md"
          />
          <span className="text-xl font-semibold tracking-tight">BackPorch</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm font-medium text-[#fff5f5]/80 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="rounded-lg bg-[#fff5f5] px-3.5 py-1.5 text-sm font-medium text-[#991b1b] transition-colors hover:bg-white"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
