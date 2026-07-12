import React from "react";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { DashboardHeader } from "./dashboard-header";
import { AppSidebar } from "./app-sidebar";
// import { createFileRoute } from "@tanstack/react-router";

// import { getSession } from "@/actions";
// import { AppSidebar } from "@/components/app-sidebar";
// import { DashboardHeader } from "@/components/dashboard-header";
// import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const defaultOpen = true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />

      <SidebarInset className="shadow-lg border m-5">
        <DashboardHeader />

          <main
            className="min-h-full md:px-5 w-full pb-8"
            style={{ minHeight: "50vh" }}
          >
            {children}
          </main>
      </SidebarInset>
    </SidebarProvider>
  );
}