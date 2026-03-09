import { MDXRemote } from "next-mdx-remote/rsc";

interface Props {
  content: string;
}

export function MDXContent({ content }: Props) {
  return (
    <div className="prose-custom">
      <MDXRemote source={content} />
    </div>
  );
}
