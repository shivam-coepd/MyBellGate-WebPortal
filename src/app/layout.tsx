import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "MyGateBell - The New Standard of Entry",
  description:
    "Empower your community with the world's most trusted gate management system. Seamless visitor tracking, automated deliveries, and real-time security alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">{children}</main>
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
