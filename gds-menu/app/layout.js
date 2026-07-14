import './globals.css';

export const metadata = {
  title: "GD's Fast Food — Digital Menu",
  description:
    "Scan the QR code and explore the full menu of GD's Fast Food, Chembur, Mumbai. Established since 1986.",
  keywords: "GD's Fast Food, menu, fast food, Chembur, Mumbai, biryani, non-veg",
  openGraph: {
    title: "GD's Fast Food — Digital Menu",
    description: "Scan & explore our premium menu. Since 1986.",
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#080808',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GD's Menu" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
