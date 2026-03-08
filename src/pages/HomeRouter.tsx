import { useEffect, useState } from "react";
import Home from "./Home";
import HomeMobile from "./HomeMobile";

const MOBILE_BREAKPOINT = 768;

export default function HomeRouter() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <HomeMobile /> : <Home />;
}