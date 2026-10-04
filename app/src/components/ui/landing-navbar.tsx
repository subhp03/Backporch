"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

/**
 * Floating pill: shows only the logo, expands on hover to reveal the
 * name and a sign-up button.
 */
export const LandingNavbar: React.FC = () => {
  const [hovering, setHovering] = useState(false)

  return (
    <motion.nav
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      initial={false}
      animate={{ width: hovering ? 340 : 160 }}
      transition={{ type: 'spring', stiffness: 180, damping: 28 }}
      className="flex h-14 items-center overflow-hidden rounded-full bg-[#991b1b]/80 px-3 shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md"
    >
      <Link href="/" className="flex shrink-0 items-center gap-3">
        <Image
          src="/logo.png"
          alt="BackPorch"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-[#fff5f5]">
          BackPorch
        </span>
      </Link>

      <motion.div
        initial={false}
        animate={{ opacity: hovering ? 1 : 0, x: hovering ? 0 : -12 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: hovering ? 0.08 : 0 }}
        style={{ pointerEvents: hovering ? 'auto' : 'none' }}
        className="ml-auto shrink-0"
      >
        <Link
          href="/sign-up"
          tabIndex={hovering ? 0 : -1}
          className="block whitespace-nowrap rounded-full bg-[#fff5f5] px-5 py-2 text-sm font-semibold text-[#991b1b] transition-colors hover:bg-white"
        >
          Get started
        </Link>
      </motion.div>
    </motion.nav>
  )
}
