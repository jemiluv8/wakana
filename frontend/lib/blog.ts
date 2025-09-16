import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "content/blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  author: string;
  tags: string[];
  content: string;
  readingTime: string;
};

export function getPostSlugs() {
  try {
    const files = fs.readdirSync(postsDirectory);
    return files.filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
  } catch (error) {
    console.error("Error reading blog posts directory:", error);
    return [];
  }
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const realSlug = slug.replace(/\.(mdx|md)$/, "");
    const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
    let fileContents: string;
    
    // Try .mdx first, then .md
    if (fs.existsSync(fullPath)) {
      fileContents = fs.readFileSync(fullPath, "utf8");
    } else {
      const mdPath = path.join(postsDirectory, `${realSlug}.md`);
      if (fs.existsSync(mdPath)) {
        fileContents = fs.readFileSync(mdPath, "utf8");
      } else {
        return null;
      }
    }

    const { data, content } = matter(fileContents);
    const stats = readingTime(content);

    return {
      slug: realSlug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString(),
      excerpt: data.excerpt || "",
      author: data.author || "Wakana Team",
      tags: data.tags || [],
      content,
      readingTime: stats.text,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function getLatestPosts(count: number = 5): BlogPost[] {
  return getAllPosts().slice(0, count);
}