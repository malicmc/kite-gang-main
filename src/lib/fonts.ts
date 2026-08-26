import { Fraunces, Inter } from "next/font/google";

export const headingFont = Fraunces({
  variable: "--font-heading-display",
  subsets: ["latin", "latin-ext"],
});

export const bodyFont = Inter({
  variable: "--font-sans-body",
  subsets: ["latin", "latin-ext"],
});
