import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NeuralLog - Tenant Dashboard",
  description: "NeuralLog tenant dashboard for managing AI logging",
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
