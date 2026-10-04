"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { LandingNavbar } from "@/components/ui/landing-navbar";

export function FloatingNav() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [20, 70], [0, 1]);
  const y = useTransform(scrollY, [20, 70], [-16, 0]);
  const pointerEvents = useTransform(scrollY, [20, 21], ["none", "auto"]);

  return (
    <motion.div
      className="fixed inset-x-0 top-6 z-50 flex justify-center"
      style={{ opacity, y, pointerEvents }}
    >
      <LandingNavbar />
    </motion.div>
  );
}
