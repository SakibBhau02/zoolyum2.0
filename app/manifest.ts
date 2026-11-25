import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zoolyum — Consultancy. Strategy. Solution.",
    short_name: "Zoolyum",
    description:
      "Strategy-first brand and digital consultancy in Dhaka, Bangladesh. Brand strategy, digital design, growth marketing and content.",
    start_url: "/",
    display: "standalone",
    background_color: "#241F1B",
    theme_color: "#241F1B",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
