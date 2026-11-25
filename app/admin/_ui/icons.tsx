import type { SVGProps } from "react";

/**
 * Small stroke icon set. Inline SVG keeps the admin dependency-free and
 * lets each icon inherit `currentColor` from its button or nav item.
 */
const PATHS: Record<string, string[]> = {
  dashboard: ["M4 4h6v6H4z", "M14 4h6v4h-6z", "M14 12h6v8h-6z", "M4 14h6v6H4z"],
  home: ["M3 10.5 12 3l9 7.5", "M6 9.5V21h12V9.5"],
  file: ["M6 3h8l4 4v14H6z", "M14 3v4h4", "M9 12h6", "M9 16h6"],
  layers: ["M12 3 3 8l9 5 9-5-9-5z", "M3 13l9 5 9-5"],
  sparkles: ["M12 3v4", "M12 17v4", "M3 12h4", "M17 12h4", "M6.5 6.5 9 9", "M15 15l2.5 2.5", "M17.5 6.5 15 9", "M9 15l-2.5 2.5"],
  users: ["M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M2 21c0-3.5 3-6 7-6s7 2.5 7 6", "M17 4.5a3.5 3.5 0 0 1 0 7", "M18 15c2.3.7 4 2.8 4 6"],
  briefcase: ["M3 8h18v11H3z", "M9 8V5h6v3", "M3 13h18"],
  quote: ["M4 6h7v7H6c0 2 1 3 3 3", "M15 6h5v7h-4c0 2 1 3 3 3"],
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
  settings: ["M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", "M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3", "M4.9 4.9 7 7", "M17 17l2.1 2.1", "M19.1 4.9 17 7", "M7 17l-2.1 2.1"],
  inbox: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
  image: ["M4 4h16v16H4z", "M4 16l5-5 4 4 3-3 4 4", "M15 8h.01"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.3-4.3"],
  plus: ["M12 5v14", "M5 12h14"],
  external: ["M14 4h6v6", "M20 4l-9 9", "M18 14v6H4V6h6"],
  chevron: ["M9 6l6 6-6 6"],
  chevronDown: ["M6 9l6 6 6-6"],
  command: ["M9 3a3 3 0 1 0 0 6h6a3 3 0 1 0 0-6 3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H9a3 3 0 1 0 3 3V6a3 3 0 0 0-3-3z"],
  shield: ["M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z", "M9 12l2 2 4-4"],
  activity: ["M3 12h4l3-8 4 16 3-8h4"],
  seo: ["M4 5h16", "M4 12h10", "M4 19h7", "M17 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z", "M21 21l-1.5-1.5"],
  redirect: ["M4 6v6a4 4 0 0 0 4 4h9", "M14 12l4 4-4 4"],
  alert: ["M12 3 2 21h20L12 3z", "M12 9v5", "M12 18h.01"],
  check: ["M4 12l5 5L20 6"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 14h10l1-14", "M10 11v6", "M14 11v6"],
  copy: ["M9 9h11v11H9z", "M5 15H4V4h11v1"],
  edit: ["M4 20h4L20 8l-4-4L4 16z", "M14 6l4 4"],
  arrowLeft: ["M19 12H5", "M11 6l-6 6 6 6"],
  arrowRight: ["M5 12h14", "M13 6l6 6-6 6"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  mail: ["M3 6h18v12H3z", "M3 7l9 6 9-6"],
  globe: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M3 12h18", "M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3z"],
  lock: ["M6 10h12v10H6z", "M9 10V7a3 3 0 0 1 6 0v3"],
  eye: ["M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  history: ["M3 12a9 9 0 1 0 3-6.7", "M3 4v5h5", "M12 8v4l3 2"],
  tag: ["M3 12V4h8l10 10-8 8L3 12z", "M7.5 7.5h.01"],
  link: ["M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1", "M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"],
  bolt: ["M13 2 4 14h6l-1 8 9-12h-6z"],
  download: ["M12 3v12", "M7 10l5 5 5-5", "M4 21h16"],
  filter: ["M3 5h18l-7 8v6l-4 2v-8z"],
  more: ["M6 12h.01", "M12 12h.01", "M18 12h.01"],
};

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  className = "h-4 w-4",
  strokeWidth = 1.7,
  ...rest
}: { name: IconName; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...rest}
    >
      {(PATHS[name] ?? PATHS.dashboard).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
