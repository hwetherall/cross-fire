import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crossfire — Innovera Debate Engine',
  description: 'Red Team / Blue Team debate simulation for consulting deliverables',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
