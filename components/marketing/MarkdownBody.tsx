import ReactMarkdown from "react-markdown";

export default function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="prose prose-slate mt-8 max-w-none text-gray-800">
      <ReactMarkdown>{source}</ReactMarkdown>
    </div>
  );
}
