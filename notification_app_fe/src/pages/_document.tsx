/**
 * src/pages/_document.tsx
 * Custom Next.js Document — adds Google Fonts for Inter typography.
 */

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="description" content="Campus Notification System — stay updated with events, results, and placement alerts." />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
