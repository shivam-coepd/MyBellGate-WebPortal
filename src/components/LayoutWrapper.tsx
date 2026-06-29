"use client";
import type { ReactNode } from "react";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Hide Navbar and Footer on dashboard routes
  const hideNavFooterRoutes = ["/admin", "/super-admin", "/login"];
  const shouldHide = hideNavFooterRoutes.some((route) =>
    pathname?.startsWith(route)
  );

  return (
    <>
      {!shouldHide && <Navbar />}
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">{children}</main>
      </div>
      {!shouldHide && <Footer />}
    </>
  );
}
