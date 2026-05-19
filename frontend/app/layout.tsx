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
        <main className="pb-8 px-4 sm:px-0"> {/* Removed pt-20 */}
          {children}
        </main>
      </body>
    </html>
  );
}