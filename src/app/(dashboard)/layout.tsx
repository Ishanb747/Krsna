"use client";

import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

import { useAgentStore } from "@/hooks/useAgentStore";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useAgentStore();

  return (
    <ProtectedRoute>
      <div className={clsx("flex h-screen bg-transparent transition-opacity duration-300", isOpen ? "opacity-0 pointer-events-none" : "opacity-100")}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 pt-20 md:p-6 md:pt-6 lg:p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
