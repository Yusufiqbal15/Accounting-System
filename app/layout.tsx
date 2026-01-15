import type { Metadata } from 'next';
import './src/styles/index.css';
import './src/styles/theme.css';

export const metadata: Metadata = {
  title: 'Accounting Inventory Production System',
  description: 'Comprehensive accounting, inventory, and production management system',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white text-foreground">
        {children}
      </body>
    </html>
  );
}
