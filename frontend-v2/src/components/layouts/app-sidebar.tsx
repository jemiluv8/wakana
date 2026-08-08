import {
  FolderGit2,
  Goal,
  Info,
  LayoutDashboardIcon,
  Quote,
  Receipt,
  Settings2,
  SquareActivity,
  TrendingUpIcon,
  Trophy,
  UsersIcon,
} from "lucide-react";

import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "../ui/sidebar";
import { Link } from "@tanstack/react-router";
import { AppSidebarLogo } from "./app-sidebar-logo";

const SIMPLE_MENU_ITEMS = [
  {
    title: "FAQ",
    url: "/dashboard/faqs",
    icon: Quote,
  },
  {
    title: "About",
    url: "/dashboard/about",
    icon: Info,
  },
  {
    title: "Leaderboards",
    url: "/dashboard/leaderboards",
    icon: Trophy,
  },
  {
    title: "Plugin Status",
    url: "/dashboard/plugins/status",
    icon: SquareActivity,
  },
  {
    title: "Setup Guide",
    url: "/dashboard/setup",
    icon: Settings2,
  },
];

export const MAIN_MENU_ITEMS = [
  {
    group: "Dashboard",
    children: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboardIcon,
      },
      {
        title: "Projects",
        url: "/projects",
        icon: FolderGit2,
      },
    ],
  },
  {
    group: "Freelance",
    children: [
      {
        title: "Clients",
        url: "/dashboard/clients",
        icon: UsersIcon,
      },
      {
        title: "Invoices",
        url: "/dashboard/invoices",
        icon: Receipt,
      },
    ],
  },
  {
    group: "Miscellaneous",
    children: SIMPLE_MENU_ITEMS,
  },
];

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        <AppSidebarLogo />
        <div className="flex h-screen flex-col">
          {MAIN_MENU_ITEMS.map((item) => (
            <SidebarGroup key={item.group}>
              <SidebarGroupLabel>{item.group}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.children.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        // isActive={sidebarActive(item)}
                        // @todo: move this to client component and implement isActive
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
