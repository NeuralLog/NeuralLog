import type { Metadata } from "next";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "NeuralLog",
  description: "NeuralLog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
