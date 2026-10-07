import React from "react";
import Link from "next/link";
import { Globe, Mail } from "lucide-react";
const logo = "/assets/mygatebell_logo.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 font-['Plus_Jakarta_Sans'] text-sm leading-relaxed">
        <div className="col-span-2 lg:col-span-2">
          <Link href="/" className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <img
              src={logo}
              alt="MyGateBell Logo"
              className="w-7 h-7 md:w-9 md:h-9 object-contain"
            />
            MyGateBell
          </Link>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mb-8">
            Redefining community living through technology, trust, and
            transparency. Join 1,000+ societies today.
          </p>
          <div className="flex gap-4">
            <a
              className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-secondary hover:text-white transition-all"
              href="#"
            >
              <Globe className="w-5 h-5" />
            </a>
            <a
              className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-secondary hover:text-white transition-all"
              href="#"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div>
          <h5 className="font-bold text-primary dark:text-white mb-6">
            Company
          </h5>
          <ul className="space-y-4">
            <li>
              <Link
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="/"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="/product"
              >
                Product
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="/features"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="/pricing"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="/about"
              >
                About Us
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-primary dark:text-white mb-6">
            Support
          </h5>
          <ul className="space-y-4">
            <li>
              <a
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="#"
              >
                Help Center
              </a>
            </li>
            <li>
              <a
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="/contact"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                className="text-slate-500 hover:text-secondary hover:underline decoration-2 underline-offset-4"
                href="#"
              >
                Guard Training
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
        <p>© 2026 MyGateBell. The New Standard of Society Management.</p>
        <div className="flex gap-6">
          <a className="hover:text-primary" href="#">
            Terms
          </a>
          <Link className="hover:text-primary" href="/privacy-policy">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
