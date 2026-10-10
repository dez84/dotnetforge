import './globals.css';
import { Providers } from '../components/Providers';
import { Navbar } from '../components/Navbar';
import { ServiceWorkerRegistrar } from '../components/ServiceWorkerRegistrar';

export const metadata = {
  title: 'DotNetForge — Learn Modern C# & .NET',
  description:
    'Interactive micro-learning for C# 12/13, ASP.NET Core, EF Core, Blazor, and guided capstone projects.',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'DotNetForge' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0b0f1a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-forge-bg text-forge-text antialiased">
        <Providers>
          <ServiceWorkerRegistrar />
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-6 pb-24 lg:pb-10">{children}</main>
          <footer className="border-t border-forge-border px-4 py-6 text-center text-xs text-forge-muted">
            DotNetForge · built for VS Code + WSL2 learners · {new Date().getFullYear()}
          </footer>
        </Providers>
      </body>
    </html>
  );
}
