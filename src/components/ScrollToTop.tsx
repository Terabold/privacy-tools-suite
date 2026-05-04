import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset scroll position
    const container = document.getElementById("app-main-scroll");
    if (container) {
      container.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }

    // 2. Forcefully remove any residual scroll locks on route change
    // This fixes a known bug with mobile browsers and Radix UI overlays (Dialogs, Dropdowns)
    // where pointer-events: none or overflow: hidden gets stuck on the body after navigation.
    document.body.style.pointerEvents = "";
    document.documentElement.style.pointerEvents = "";
    
    // Remove inline overflow styles that might have been injected
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
    
    // Remove Radix data attributes that lock scroll
    document.body.removeAttribute("data-scroll-locked");
    
    // Also remove any active focus that might trap scroll
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
