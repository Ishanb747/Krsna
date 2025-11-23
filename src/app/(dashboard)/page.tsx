"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeView from "@/components/WelcomeView";
import DashboardContent from "@/components/DashboardContent";

export default function DashboardPage() {
  const [view, setView] = useState<"welcome" | "dashboard">("welcome");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && view === "welcome") {
        setView("dashboard");
      } else if (e.key === "ArrowLeft" && view === "dashboard") {
        setView("welcome");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [view]);

  return (
    <div className="relative min-h-full overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {view === "welcome" ? (
          <motion.div
            key="welcome"
            initial={{ x: -1000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -1000, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full"
          >
            <WelcomeView onNavigate={() => setView("dashboard")} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ x: 1000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 1000, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full h-full"
          >
            <DashboardContent onNavigateBack={() => setView("welcome")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
