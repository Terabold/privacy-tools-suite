import type { Transition, Variants } from "framer-motion";

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 24,
  mass: 0.8,
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: premiumEase },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: premiumEase },
  },
};

export const revealContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.055,
    },
  },
};

export const revealItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: smoothSpring,
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...smoothSpring, stiffness: 180 },
  },
};

export const overlayMotion: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: premiumEase },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.99,
    transition: { duration: 0.14, ease: premiumEase },
  },
};
