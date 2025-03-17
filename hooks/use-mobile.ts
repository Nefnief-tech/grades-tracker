import { useState, useEffect } from "react";

export const useIsMobile = (): boolean => {
  // Default to false since this will be used during SSR
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      // Update threshold to a higher breakpoint to prevent unwanted white space
      setIsMobile(window.innerWidth < 1024); // Changed from 768 to 1024
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return isMobile;
};
