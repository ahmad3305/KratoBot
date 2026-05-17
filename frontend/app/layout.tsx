import React from "react";
import "../styles/globals.css";

export const metadata = {
  title: "KratoBot",
  description: "Competitor & Brand Authority Intelligence Dashboard",
  viewport: "width=device-width, initial-scale=1.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans bg-neu-bg text-neu-text">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content={metadata.viewport} />
        <link rel="icon" href="/images/logo.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-neu-bg antialiased selection:bg-krato-light selection:text-krato">
        {/* Top left branding (optional, hide on login/signup page if you want) */}
        <div className="absolute top-4 left-4 flex items-center z-40">
          <img
            src="/images/logo.svg"
            alt="KratoBot logo"
            className="w-10 h-10 mr-2"
            draggable={false}
          />
          <span className="text-xl font-display font-bold tracking-tight text-krato hidden sm:inline">
            KratoBot
          </span>
        </div>
        {/* The actual page/app content */}
        <main className="pt-20 pb-8 px-4 sm:px-0">
          {children}
        </main>
      </body>
    </html>
  );
}