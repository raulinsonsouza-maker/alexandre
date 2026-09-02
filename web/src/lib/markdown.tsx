import type { ReactNode } from "react";

/** Markdown leve para posts do blog (sem dependência externa). */
export function renderMarkdown(body: string) {
  const blocks = body.replace(/\r\n/g, "\n").split(/\n\n+/);
  return blocks.map((block, i) => {
    const t = block.trim();
    if (!t) return null;

    if (t.startsWith("### ")) {
      return (
        <h3 key={i} className="mt-6 text-lg font-semibold text-white">
          {inline(t.slice(4))}
        </h3>
      );
    }
    if (t.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
          {inline(t.slice(3))}
        </h2>
      );
    }
    if (t.startsWith("# ")) {
      return (
        <h2 key={i} className="mt-8 font-[family-name:var(--font-display)] text-2xl font-bold text-white">
          {inline(t.slice(2))}
        </h2>
      );
    }
    if (t.startsWith("> ")) {
      return (
        <blockquote key={i} className="mt-4 border-l-2 border-[#f7bd31]/40 pl-4 text-[#bdbdbd] italic">
          {inline(t.replace(/^>\s?/gm, ""))}
        </blockquote>
      );
    }
    if (/^```/.test(t)) {
      const code = t.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "");
      return (
        <pre key={i} className="mt-4 overflow-x-auto rounded-lg bg-[#121014] p-4 text-sm text-[#e8e8e8]">
          <code>{code}</code>
        </pre>
      );
    }
    if (/^(- |\d+\. )/m.test(t) && t.split("\n").every((l) => /^(- |\d+\. )/.test(l.trim()) || !l.trim())) {
      const ordered = /^\d+\. /.test(t.trim());
      const Tag = ordered ? "ol" : "ul";
      const items = t.split("\n").filter(Boolean);
      return (
        <Tag key={i} className={`mt-4 space-y-1 pl-5 text-[#cfcfcf] ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((line, j) => (
            <li key={j}>{inline(line.replace(/^(- |\d+\. )/, ""))}</li>
          ))}
        </Tag>
      );
    }
    return (
      <p key={i} className="mt-4 text-[16.5px] leading-relaxed text-[#cecece]">
        {inline(t)}
      </p>
    );
  });
}

function inline(text: string) {
  const parts: (string | ReactNode)[] = [];
  const re = /(\*\*(.+?)\*\*|`(.+?)`|\[(.+?)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {m[2]}
        </strong>,
      );
    } else if (m[3]) {
      parts.push(
        <code key={key++} className="rounded bg-white/10 px-1 py-0.5 text-[0.9em] text-[#f7bd31]">
          {m[3]}
        </code>,
      );
    } else if (m[4] && m[5]) {
      parts.push(
        <a key={key++} href={m[5]} className="text-[#f7bd31] underline-offset-2 hover:underline">
          {m[4]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}
