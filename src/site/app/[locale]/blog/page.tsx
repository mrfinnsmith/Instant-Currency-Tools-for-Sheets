import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Blog",
    description: "Tips and guides for currency conversion in Google Sheets.",
    alternates: {
      canonical: `/${locale}/blog`,
      languages: getLanguageAlternates("/blog"),
    },
    openGraph: {
      title: "Blog",
      description: "Tips and guides for currency conversion in Google Sheets.",
      url: `https://instantcurrency.tools/${locale}/blog`,
      locale: ogLocales[locale as Locale],
    },
  };
}

export default async function Blog({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <section className="pt-16 pb-6 md:pt-24">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-700 text-fg md:text-4xl">
          Blog
        </h1>
      </section>

      <section className="pb-20 max-w-3xl">
        {posts.length === 0 ? (
          <p className="text-[15px] text-muted">Nothing here yet.</p>
        ) : (
          <div className="divide-y divide-rule">
            {posts.map((post) => (
              <article key={post.slug} className="py-8 first:pt-4">
                <Link href={`/${locale}/blog/${post.slug}`} className="group block">
                  <time className="text-[12px] text-faint tracking-wide">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className="mt-2 font-[family-name:var(--font-heading)] text-xl font-600 text-fg group-hover:text-teal transition-colors duration-150">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-[14px] leading-[1.65] text-muted">
                    {post.description}
                  </p>
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
