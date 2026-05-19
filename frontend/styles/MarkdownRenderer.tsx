"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div
      className="
        prose prose-invert prose-lg max-w-none

        prose-headings:text-[#408CF1]
        prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8
        prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-6 prose-h2:text-cyan-400
        prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-4 prose-h3:text-cyan-300

        prose-p:text-zinc-300 prose-p:leading-7 prose-p:mb-4
        prose-strong:text-white prose-strong:font-semibold
        
        prose-li:text-zinc-300 prose-li:my-1
        prose-li:marker:text-cyan-400
        
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6

        prose-a:text-[#408CF1] prose-a:font-medium prose-a:no-underline
        hover:prose-a:text-cyan-300 hover:prose-a:underline
        
        prose-code:text-cyan-400 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl

        prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-400

        prose-table:border-collapse prose-table:w-full
        prose-th:bg-zinc-900 prose-th:text-white prose-th:font-semibold prose-th:p-3 prose-th:border prose-th:border-zinc-800
        prose-td:p-3 prose-td:border prose-td:border-zinc-800 prose-td:text-zinc-300
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}