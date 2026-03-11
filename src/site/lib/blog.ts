import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  content: string;
}

function readPost(filename: string, locale: string): BlogPost {
  const slug = filename.replace(/\.mdx$/, "");
  const localePath = path.join(BLOG_DIR, locale, filename);
  const defaultPath = path.join(BLOG_DIR, filename);
  const filePath =
    locale !== "en" && fs.existsSync(localePath) ? localePath : defaultPath;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    content,
  };
}

export function getAllPosts(locale: string = "en"): BlogPost[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
  const posts = files.map((filename) => readPost(filename, locale));

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getPost(
  slug: string,
  locale: string = "en"
): BlogPost | undefined {
  const posts = getAllPosts(locale);
  return posts.find((p) => p.slug === slug);
}
