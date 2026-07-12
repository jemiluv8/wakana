import { Link } from "@tanstack/react-router";

export function MainHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-8 z-50 mb-20 mt-8 hidden justify-center rounded-lg px-2 md:flex md:px-4 font-bold">
      <nav className="z-20 flex h-[50px] items-center rounded-full border border-border bg-opacity-70 px-4 backdrop-blur-xl text-primary">
        <Link to="/">
          <img src="/white-icon.svg" alt="Logo" width={80} height={56} />
        </Link>

        <ul className="mx-3 space-x-2 text-sm md:flex font-bold">
          <Link
            to="/installation"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            Installation
          </Link>

          <Link
            to="/faqs"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            FAQ
          </Link>

          <Link
            to="/plugins"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            Plugins
          </Link>

          <Link
            to="/leaderboard"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            Leaderboard
          </Link>
        </ul>

        <div className="hidden border-l border-border pl-4 pr-2 text-sm font-medium md:flex md:items-center md:gap-2">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="inline-flex h-8 items-center px-3 py-2 bg-primary rounded-md text-secondary"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="inline-flex h-8 items-center px-3 py-2 bg-primary text-secondary font-bold rounded-md"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
