import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Blog | Wakana",
  description: "Insights on developer productivity, time tracking, and coding efficiency",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No blog posts yet. Check back soon!
          </p>
        ) : (
          posts.map((post) => (
            <article
              key={post.slug}
              className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0"
            >
              <Link
                href={`/blog/${post.slug}`}
                className="block group hover:no-underline"
              >
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h2>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
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
                  {post.author && (
                    <div className="sm:hidden">
                      {post.author}
                    </div>
                  )}
                </div>
                
                {post.excerpt && (
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
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
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}