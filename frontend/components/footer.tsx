import CustomLink from "./custom-link";

export default function Footer() {
  return (
    <footer className="mx-0 my-4 flex w-full flex-col gap-4 px-4 text-sm sm:mx-auto sm:my-12 sm:h-5 sm:max-w-3xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <CustomLink href="https://nextjs.authjs.dev">Documentation</CustomLink>
        <CustomLink href="https://www.npmjs.com/package/next-auth">
          NPM
        </CustomLink>
        <CustomLink href="https://github.com/nextauthjs/next-auth/tree/main/apps/examples/nextjs">
          Source on GitHub
        </CustomLink>
        <CustomLink href="/policy">Policy</CustomLink>
      </div>
      <div className="flex items-center justify-start gap-2"></div>
    </footer>
  );
}
