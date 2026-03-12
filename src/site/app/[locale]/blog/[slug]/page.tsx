import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/blog";
import { MDXContent } from "@/components/mdx-content";
import { getLanguageAlternates } from "@/i18n/hreflang";
import { ogLocales, type Locale } from "@/i18n/config";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug, locale);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/${locale}/blog/${slug}`,
      languages: getLanguageAlternates(`/blog/${slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://instantcurrency.tools/${locale}/blog/${slug}`,
      type: "article",
      locale: ogLocales[locale as Locale],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPost(slug, locale);
  if (!post) notFound();
  const dateLocale = ogLocales[locale as Locale].replace("_", "-");

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    url: `https://instantcurrency.tools/${locale}/blog/${slug}`,
    inLanguage: locale,
    image: "https://instantcurrency.tools/blog/image-1.png",
    author: {
      "@type": "Organization",
      name: "Instant Currency",
      url: "https://instantcurrency.tools",
    },
    publisher: {
      "@type": "Organization",
      name: "Instant Currency",
      url: "https://instantcurrency.tools",
      logo: {
        "@type": "ImageObject",
        url: "https://instantcurrency.tools/logo.png",
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://instantcurrency.tools/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `https://instantcurrency.tools/${locale}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://instantcurrency.tools/${locale}/blog/${slug}`,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="pt-16 pb-20 md:pt-24 max-w-3xl">
        <header>
          <time className="text-[12px] text-faint tracking-wide">
            {new Date(post.date).toLocaleDateString(dateLocale, {
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
