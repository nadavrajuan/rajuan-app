import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rajuan — Projects',
  description: 'A gallery of projects by Nadav Rajuan',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans selection:bg-secondary selection:text-on-secondary">
        {children}
      </body>
    </html>
  );
}
