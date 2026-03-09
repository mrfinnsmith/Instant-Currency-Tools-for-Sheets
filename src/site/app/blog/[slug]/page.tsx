import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/blog";
import { MDXContent } from "@/components/mdx-content";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.description };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <article className="pt-16 pb-20 md:pt-24 max-w-3xl">
        <header>
          <time className="text-[12px] text-faint tracking-wide">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl leading-tight">
            {post.title}
          </h1>
        </header>
        <div className="mt-12 prose-custom">
          <MDXContent content={post.content} />
        </div>
      </article>
    </div>
  );
}
