import { cookies } from "next/headers";
import React from "react";

import { getSession } from "@/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
// import { MobileHeader } from "@/components/mobile-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await getSession(true);
  const cookieStore = cookies();
  const currentState = cookieStore.get("sidebar:state")?.value;
  const defaultOpen = currentState ? currentState === "true" : true;

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <SidebarInset className="shadow-lg border border-[##dddddd] m-5">
        <DashboardHeader />
        {/* <MobileHeader /> */}
        <main
          className="min-h-full md:px-5 w-full"
          style={{ minHeight: "50vh" }}
        >
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
