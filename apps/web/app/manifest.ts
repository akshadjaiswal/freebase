import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Freebase",
    short_name: "Freebase",
    description: "The free product feedback platform",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e10",
    theme_color: "#10b981",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
