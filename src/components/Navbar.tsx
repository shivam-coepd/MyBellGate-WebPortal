"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import ScrollProgress from "./ScrollProgress";
const logo = "/assets/mygatebell_logo.png";

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Product", path: "/product" },
    { name: "Features", path: "/features" },
    { name: "Security", path: "/security" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-transparent">
      <div className="relative ">
        <ScrollProgress />
        <header className="py-3">
          <div className="max-w-7xl mx-auto px-4 xl:px-0">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-between gap-x-4 rounded-2xl py-2.5 pl-5 pr-2.5 shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:justify-stretch lg:gap-x-12 lg:rounded-[1.375rem]">
              <div className="flex items-center gap-x-5">
                <a href="/" title="Home">
                  <img className="h-8" src={logo} alt="Logo" />
                </a>
                <span className="hidden h-4 w-[1px] bg-neutral-300 lg:block"></span>
              </div>
              <nav className="hidden lg:block">
                <ul className="flex items-center">
                  <li
                    className={isActive("/") ? "border-b-2 border-primary" : ""}
                  >
                    <a
                      className="px-3 py-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-600"
                      href="/"
                    >
                      Home
                    </a>
                  </li>
                  <li
                    className={
                      isActive("/product") ? "border-b-2 border-primary" : ""
                    }
                  >
                    <a
                      className="px-3 py-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-600"
                      href="/product"
                    >
                      Product
                    </a>
                  </li>

                  <li
                    className={
                      isActive("/features") ? "border-b-2 border-primary" : ""
                    }
                  >
                    <a
                      className="flex items-center gap-x-1.5 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-600"
                      href="/features"
                    >
                      Features
                      <svg
                        className="h-4 text-neutral-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        data-slot="icon"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </a>
                  </li>
                  <li
                    className={
                      isActive("/security") ? "border-b-2 border-primary" : ""
                    }
                  >
                    <a
                      className="px-3 py-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-600"
                      href="/security"
                    >
                      Security
                    </a>
                  </li>
                  <li
                    className={
                      isActive("/pricing") ? "border-b-2 border-primary" : ""
                    }
                  >
                    <a
                      className="px-3 py-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-600"
                      href="/pricing"
                    >
                      Pricing
                    </a>
                  </li>
                  <li
                    className={
                      isActive("/about") ? "border-b-2 border-primary" : ""
                    }
                  >
                    <a
                      className="px-3 py-2 text-sm font-medium text-neutral-700 transition hover:text-neutral-600"
                      href="/about"
                    >
                      About
                    </a>
                  </li>
                </ul>
              </nav>
              <div className="flex items-center gap-x-10 justify-self-end">
                <span className="hidden h-4 w-[1px] bg-neutral-300 lg:block"></span>
                <div className="flex items-center gap-x-3 lg:gap-x-2">
                  <a
                    href="/login"
                    title="Log in"
                    className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:shadow-[0_0px_0px_2px_rgba(15,23,42,0.25),0_2px_10px_0px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] border border-neutral-100 bg-white text-neutral-700 hover:border-neutral-200 hover:bg-neutral-100 disabled:border-slate-900/5 disabled:bg-slate-50/30 disabled:text-slate-900/20 px-3 py-2 rounded-[0.625rem] hidden lg:flex"
                  >
                    Log in
                  </a>
                  <a
                    href="#demoSection"
                    title="Try free"
                    className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:shadow-[0_0px_0px_2px_rgba(15,23,42,0.25),0_2px_10px_0px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-900/30 disabled:text-slate-50/70 px-3 py-2 rounded-[0.625rem] flex"
                  >
                    Try free
                    <span className="ml-1 text-slate-400"> - 7 days</span>
                  </a>
                  <button
                    type="button"
                    aria-label="Open menu"
                    className="lg:hidden"
                    title="Open menu"
                  >
                    <svg
                      className="h-6 text-slate-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 9a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 9Zm0 6.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-surface-variant px-8 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              onClick={() => setMobileOpen(false)}
              className={`py-2 text-sm font-medium ${
                isActive(link.path)
                  ? "text-secondary font-semibold"
                  : "text-on-surface-variant hover:text-secondary"
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-2 py-2 text-sm font-semibold text-secondary"
          >
            Login / Get Started →
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
