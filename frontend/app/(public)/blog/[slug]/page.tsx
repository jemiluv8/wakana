import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { getPostBySlug, getPostSlugs } from "@/lib/blog";

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.(mdx|md)$/, ""),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Wakana Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

// Custom components for MDX rendering
const components = {
  h1: (props: any) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="text-xl font-semibold mt-5 mb-2" {...props} />
  ),
  p: (props: any) => <p className="mb-4 leading-relaxed" {...props} />,
  ul: (props: any) => (
    <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
  ),
  ol: (props: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
  ),
  li: (props: any) => <li className="ml-4" {...props} />,
  blockquote: (props: any) => (
    <blockquote
      className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 my-4 italic"
      {...props}
    />
  ),
  code: ({ className, ...props }: any) => {
    const isInline = !className;
    return isInline ? (
      <code
        className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm"
        {...props}
      />
    ) : (
      <code className={className} {...props} />
    );
  },
  pre: (props: any) => (
    <pre
      className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto mb-4"
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      className="text-blue-600 dark:text-blue-400 hover:underline"
      {...props}
    />
  ),
  hr: (props: any) => (
    <hr className="my-8 border-gray-300 dark:border-gray-700" {...props} />
  ),
  table: (props: any) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
        {...props}
      />
    </div>
  ),
  th: (props: any) => (
    <th
      className="px-3 py-2 text-left text-sm font-semibold bg-gray-50 dark:bg-gray-800"
      {...props}
    />
  ),
  td: (props: any) => (
    <td
      className="px-3 py-2 text-sm border-t border-gray-200 dark:border-gray-700"
      {...props}
    />
  ),
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2 sm:gap-4">
            <time dateTime={post.date}>
              {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
            </time>
            <span>•</span>
            <span>{post.readingTime}</span>
            {post.author && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{post.author}</span>
              </>
            )}
          </div>
          {post.author && <div className="sm:hidden">{post.author}</div>}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-gray-600 dark:text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <MDXRemote
          source={post.content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
          }}
        />
      </div>
    </article>
  );
}
