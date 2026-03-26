import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rajuan — Projects',
  description: 'A gallery of projects by Nadav Rajuan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
