import type { ReactNode } from "react";

/**
 * SectionHeading — eyebrow + display headline (room for one or two
 * accent words) + optional lead paragraph.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  dark = false,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  dark?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
      <p className={`eyebrow ${dark ? "eyebrow-dark" : ""}`}>{eyebrow}</p>
      <h2
        className={`mt-4 font-display text-display-2 font-semibold ${
          dark ? "text-espresso" : "text-ivory"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`body-copy mt-5 font-body text-lead ${
            dark ? "text-espresso/70" : "text-ivory/65"
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
