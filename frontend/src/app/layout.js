import localFont from "next/font/local";
//import "./globals.css";
import ThemeProviderWrapper from './themeProviderWrapper';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "CSV, Geotiff Uploader & Viewer",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
