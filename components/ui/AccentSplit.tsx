import { splitAccent } from "@/lib/text";

/**
 * AccentSplit - renders "before|accent|after" copy with the accent part
 * in a highlight style. Two segments: before + accent. One: plain.
 */
export function AccentSplit({
  text,
  accentClassName,
  className,
}: {
  text: string;
  accentClassName: string;
  className?: string;
}) {
  const [rawBefore, rawAccent, rawAfter] = splitAccent(text);
  const before = rawBefore.trim();
  const accent = rawAccent.trim();
  const after = rawAfter.trim();
  if (!accent) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {before ? `${before} ` : ""}
      <span className={accentClassName}>{accent}</span>
      {after ? ` ${after}` : ""}
    </span>
  );
}
