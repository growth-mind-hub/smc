/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextField } from "@prismicio/client";

interface PrismicRichTextRendererProps {
  document?: RichTextField | string | null;
  field?: RichTextField | string | null;
  ParaclassName?: string;
  className?: string;
}

export default function PrismicRichTextRenderer({
  document,
  field,
  ParaclassName = "",
  className = "",
}: PrismicRichTextRendererProps) {
  const content = document ?? field;

  if (!content) {
    return null;
  }

  // If passed as a plain string, render as a styled paragraph
  if (typeof content === "string") {
    return (
      <div className={className}>
        <p className={`text-[#5F6B7A] font-normal font-manrope leading-relaxed ${ParaclassName}`}>
          {content}
        </p>
      </div>
    );
  }

  // If array is empty
  if (Array.isArray(content) && content.length === 0) {
    return null;
  }

  // Custom Serializers for Prismic Rich Text
  const customSerializers = {
    paragraph: ({ children }: { children: React.ReactNode }) => {
      if (!children) return null;
      return (
        <p
          className={`pt-1 pb-2 text-sm sm:text-base font-normal font-manrope text-[#5F6B7A] leading-relaxed ${ParaclassName}`}
        >
          {children}
        </p>
      );
    },
    heading1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-2xl sm:text-4xl font-bold text-[#071E3B] font-manrope mb-3 mt-4 tracking-tight">
        {children}
      </h1>
    ),
    heading2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-xl sm:text-3xl font-bold text-[#071E3B] font-manrope mb-3 mt-6 tracking-tight">
        {children}
      </h2>
    ),
    heading3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-lg sm:text-2xl font-bold text-[#071E3B] font-manrope mb-2 mt-5">
        {children}
      </h3>
    ),
    heading4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-base sm:text-xl font-semibold text-[#071E3B] font-manrope mb-2 mt-4">
        {children}
      </h4>
    ),
    heading5: ({ children }: { children: React.ReactNode }) => (
      <h5 className="text-sm sm:text-lg font-semibold text-[#071E3B] font-manrope mb-2 mt-3">
        {children}
      </h5>
    ),
    heading6: ({ children }: { children: React.ReactNode }) => (
      <h6 className="text-xs sm:text-base font-medium text-[#C6A45A] font-manrope mb-2 mt-2">
        {children}
      </h6>
    ),
    list: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc pl-5 pr-2 py-2 space-y-1 text-sm sm:text-base text-[#5F6B7A] font-manrope leading-relaxed">
        {children}
      </ul>
    ),
    oList: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal pl-5 pr-2 py-2 space-y-1 text-sm sm:text-base text-[#5F6B7A] font-manrope leading-relaxed">
        {children}
      </ol>
    ),
    oListItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    listItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
    image: ({ node }: { node: any }) => {
      return (
        <img
          src={node.url || ""}
          alt={node.alt || "Service image"}
          className="mt-4 max-w-full w-full h-auto my-6 rounded-xl border border-slate-200/80 shadow-xs"
          style={{ maxHeight: "520px", objectFit: "cover" }}
        />
      );
    },
    hyperlink: ({ node, children }: { node: any; children: React.ReactNode }) => {
      const isExternal =
        node.data?.link_type === "Web" ||
        (node.data?.url && (node.data.url.startsWith("http") || node.data.url.startsWith("//")));
      const target = node.data?.target || (isExternal ? "_blank" : undefined);
      return (
        <Link
          href={node.data?.url || "#"}
          className="text-[#C6A45A] font-semibold hover:underline"
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
        >
          {children}
        </Link>
      );
    },
    strong: ({ children }: { children: React.ReactNode }) => (
      <strong className="text-[#071E3B] font-bold">{children}</strong>
    ),
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-[#5F6B7A]">
          {children}
        </table>
      </div>
    ),
    tableRow: ({ children }: { children: React.ReactNode }) => (
      <tr className="divide-x divide-slate-200 border-b border-slate-200 last:border-none">
        {children}
      </tr>
    ),
    tableHeader: ({ children }: { children: React.ReactNode }) => (
      <th className="bg-[#F8FAFC] px-4 py-3 font-semibold text-left text-[#071E3B]">
        {children}
      </th>
    ),
    tableCell: ({ children }: { children: React.ReactNode }) => (
      <td className="px-4 py-3">{children}</td>
    ),
  };

  return (
    <div className={className}>
      <PrismicRichText field={content as RichTextField} components={customSerializers as any} />
    </div>
  );
}
