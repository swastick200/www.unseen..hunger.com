import { Bebas_Neue, Manrope } from "next/font/google";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata = {
  title: "Unseen Hunger | Feed Your Cravings",
  description:
    "Modern street food startup website for Unseen Hunger in Sinthee, Kolkata. Sandwiches, pizza, fries, chai, coffee, and bold affordable flavors.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bebasNeue.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
