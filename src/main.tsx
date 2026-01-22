import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import App from "./App.tsx";
import { PremiumLoader } from "./components/PremiumLoader.tsx";
import "./index.css";

function Root() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Minimum loading time for visual effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <PremiumLoader onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>
      {!isLoading && <App />}
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
