import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

interface PageTransitionProps {
  children: ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className="page-motion-wrapper">{children}</div>;
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="page-motion-wrapper"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
