import './global.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Real Estate Analyzer',
  description: 'Enterprise-grade real estate analysis platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
