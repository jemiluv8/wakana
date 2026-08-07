import { FadeOnView } from "../custom/fade-on-view";
import PublicFooter from "../fragments/sections/components/public-footer";
import { MainHeader } from "./main-header";
import { PublicMobileHeader } from "./public-mobile-header";
import { useAuth } from "~/lib/providers/auth-provider";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen font-rubik antialiased">
      <MainHeader isLoggedIn={isAuthenticated} />
      <PublicMobileHeader />

      <main className="m-auto md:mx-14 flex flex-1 flex-col px-4 md:px-14 align-middle mb-22">
        <FadeOnView> {children}</FadeOnView>
      </main>

      <PublicFooter />
    </div>
  );
}
