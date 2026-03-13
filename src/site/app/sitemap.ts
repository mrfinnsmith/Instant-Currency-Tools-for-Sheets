import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://instantcurrency.tools";

function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${BASE_URL}/${locale}${path}`;
  }
  languages["x-default"] = `${BASE_URL}/en${path}`;
  return languages;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const translatedPages = ["", "/pricing", "/contact", "/blog"];
  const englishOnlyPages = ["/privacy", "/terms"];

  const translatedEntries = translatedPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      alternates: { languages: languageAlternates(page) },
    }))
  );

  const englishOnlyEntries = englishOnlyPages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      ...(locale === "en" && { alternates: { languages: languageAlternates(page) } }),
    }))
  );

  const staticEntries = [...translatedEntries, ...englishOnlyEntries];

  const posts = getAllPosts();
  const blogEntries = posts.flatMap((post) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      alternates: { languages: languageAlternates(`/blog/${post.slug}`) },
    }))
  );

  return [...staticEntries, ...blogEntries];
}
