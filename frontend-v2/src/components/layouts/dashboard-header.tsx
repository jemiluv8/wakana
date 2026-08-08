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
import { CurrentWorkTime } from "../custom/current-work-time";

export function DashboardHeader() {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
  const pathnameParts = pathname.split("/");
  const breadcrumbParts = pathnameParts.slice(1, pathnameParts.length - 1);
  const currentPage = pathnameParts[pathnameParts.length - 1];
  const currentPageTitle = capitalize(currentPage.replace(/-/g, " "));

  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbParts.map((part, index) => {
              const href = `/${breadcrumbParts.slice(0, index + 1).join("/")}`;

              return (
                <div className="flex items-center align-center" key={href}>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={href}>
                      {capitalize(part.replace(/-/g, " "))}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                </div>
              );
            })}
            <BreadcrumbItem className="font-extrabold">
              <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <CurrentWorkTime />
    </header>
  );
}
