import Image from "next/image";
import Link from "next/link";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            {/* Logo */}
            <div className="text-center mb-8 sm:mb-10">
              <Link href="/" className="inline-block">
                <Image
                  src="/white-logo.svg"
                  alt="Wakana"
                  width={120}
                  height={28}
                  className="h-8 w-auto dark:brightness-0 dark:invert"
                />
              </Link>
            </div>

            {/* Login Form - Card styling with border and shadow */}
            <div className="sm:p-8 sm:rounded-[2rem] sm:shadow-lg sm:border sm:border-border">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
