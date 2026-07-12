import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

export default function RouteComponent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            {/* Logo */}
            <div className="text-center mb-8 sm:mb-10">
              <Link to="/" className="inline-block">
                <img
                  src="/white-logo.svg"
                  alt="Wakana"
                  width={180}
                  height={42}
                  className="h-12 w-auto dark:brightness-0 dark:invert"
                />
              </Link>
            </div>

            {/* Login Form - Card styling with border and shadow */}
            <div className="sm:p-8 sm:rounded-[2rem] sm:shadow-lg sm:border sm:border-border">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
