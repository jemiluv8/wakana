import capitalize from "lodash/capitalize";
import { useLocation } from "@tanstack/react-router";
import { SidebarTrigger } from "../ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { Separator } from "../ui/separator";

export function DashboardHeader() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const pathnameParts = pathname.split("/");
  const currentPage = pathnameParts[pathnameParts.length - 1];
  const currentPageTitle = capitalize(currentPage.replace(/-/g, " "));

  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {pathnameParts
              .slice(0, pathnameParts.length - 1)
              .map((part, index) => (
                <div className="flex items-center align-center" key={index}>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/${part}`}>
                      {capitalize(part.replace(/-/g, " "))}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </div>
              ))}
            <BreadcrumbItem className="font-extrabold">
              <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* <CurrentWorkTime /> */}
    </header>
  );
}
