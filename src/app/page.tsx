"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  Users,
  User,
  Fingerprint,
  Landmark,
  Truck,
  Headphones,
  CalendarDays,
  MessageSquare,
  Lock,
  Eye,
  ShieldCheck,
  Star,
  Verified,
  QrCode,
  Building2,
} from "lucide-react";
const heroBackground = "/assets/heroBackground.png";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://app.mygatebell.com/backend";

async function submitSocietyRegistration(
  data: Record<string, string | number | null>,
) {
  const res = await fetch(`${API_BASE}/public/society-registrations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || json.status === false) {
    throw new Error(json.message || "Submission failed. Please try again.");
  }
  return json;
}

const Home: React.FC = () => {
  const [form, setForm] = useState({
    societyName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    towers: "",
    totalFlats: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    gst: "",
    pan: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (
      !form.societyName ||
      !form.city ||
      !form.contactName ||
      !form.contactEmail ||
      !form.contactPhone
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await submitSocietyRegistration({
        societyName: form.societyName,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        towers: form.towers ? parseInt(form.towers) : 1,
        totalFlats: form.totalFlats ? parseInt(form.totalFlats) : 0,
        contactName: form.contactName,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        gst: form.gst || null,
        pan: form.pan || null,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-background scroll-smooth">
      {/* Hero section new */}
      <div className="relative">
        <section className="relative overflow-hidden py-16 lg:py-24">
          <img
            className="absolute left-0 top-0 z-0 h-full w-full object-cover object-top"
            src={heroBackground}
            alt="Background image"
          />
          <div className="max-w-7xl mx-auto px-4 xl:px-0 relative z-10">
            <div className="grid gap-y-8 md:px-4 lg:grid-cols-2 lg:items-center lg:gap-x-12 lg:gap-y-0 lg:px-8 xl:gap-x-16 xl:px-10">
              <div className="flex flex-col items-start sm:items-center sm:text-center lg:items-start lg:text-left">
                <div className="items-center justify-center rounded-full text-sm font-medium whitespace-nowrap shadow-[0_2px_10px_0px_rgba(0,0,0,0.15)] inline-flex bg-white text-neutral-700 px-2.5 py-1">
                  Introducing MyGateBell
                </div>
                <div className="bg-gradient-to-b from-slate-800 to-slate-600 bg-clip-text text-3xl font-semibold text-transparent lg:text-5xl mt-4 sm:mx-auto sm:w-2/3 sm:text-center md:w-1/2 lg:mx-0 lg:mt-6 lg:w-5/6 lg:text-left lg:leading-tight">
                  Smart Security Starts at Your Gate.
                </div>
                <p className="mt-4 font-medium text-gray-700 text- sm:mx-auto sm:w-2/3 sm:text-center md:w-1/2 lg:mx-0 lg:mt-6 lg:w-11/12 lg:text-left">
                  Empower your community with the world's most trusted gate
                  management system. Seamless visitor tracking, automated
                  deliveries, and real-time security alerts.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:mt-12 mb-36">
                  <a
                    href="#demoSection"
                    title="Learn more"
                    className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:shadow-[0_0px_0px_2px_rgba(15,23,42,0.25),0_2px_10px_0px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] border border-neutral-100 bg-white text-neutral-700 hover:border-neutral-200 hover:bg-neutral-100 disabled:border-slate-900/5 disabled:bg-slate-50/30 disabled:text-slate-900/20 px-4 py-2.5 rounded-[0.625rem] flex"
                  >
                    <svg
                      className="shrink-0 mr-2 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Book a Demo
                    <svg
                      className="shrink-0 ml-2 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      data-slot="icon"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                  <a
                    href="#"
                    title="Download App"
                    className="items-center justify-center whitespace-nowrap text-sm font-medium transition-all focus:shadow-[0_0px_0px_2px_rgba(15,23,42,0.25),0_2px_10px_0px_rgba(0,0,0,0.05)] shadow-[0_2px_10px_0px_rgba(0,0,0,0.05)] bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-900/30 disabled:text-slate-50/70 px-4 py-2.5 rounded-[0.625rem] flex"
                  >
                    Download App
                    <svg
                      className="shrink-0 ml-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M3.61 2.99c-.37.2-.61.59-.61 1.04v15.94c0 .45.24.84.61 1.04l9.25-9.01L3.61 2.99zm10.13 8.01 2.71-2.64-9.83-5.44 7.12 8.08zm3.74-2.06-2.98 2.91 2.98 2.91 3.95-2.19c.76-.42.76-1.52 0-1.94l-3.95-2.19zm-10.86 12.14 9.83-5.44-2.71-2.64-7.12 8.08z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full leading-[0] translate-y-[1px]">
            <svg
              className="text-surface fill-current"
              fill="none"
              viewBox="0 0 1440 120"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 120L60 110C120 100 240 80 360 73.3C480 66.7 600 73.3 720 83.3C840 93.3 960 106.7 1080 103.3C1200 100 1320 80 1380 70L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"></path>
            </svg>
          </div>
        </section>
      </div>

      {/* Stats Section */}
      <section className="bg-surface py-16">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              5M+
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              Homes Empowered
            </p>
          </div>
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              27K+
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              Communities
            </p>
          </div>
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              1B+
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              Entries Managed
            </p>
          </div>
          <div className="text-center group">
            <h3 className="font-h2 text-primary mb-2 transition-transform group-hover:scale-110 duration-500">
              4.8★
            </h3>
            <p className="text-on-surface-variant font-label-caps uppercase tracking-widest text-xs">
              App Store Rating
            </p>
          </div>
        </div>
      </section>

      {/* LOGO MARQUEE */}
      <section>
        <div className="logos-section">
          <div className="logos-label">
            Trusted by societies in cities across India
          </div>
          <div className="logos-track" id="logos-track">
            {[
              { name: "Greenwood Heights", city: "Navi Mumbai" },
              { name: "Sunrise Valley", city: "Pune" },
              { name: "Park View Residency", city: "Bengaluru" },
              { name: "Blue Bell Towers", city: "Kolkata" },
              { name: "Silver Oak Enclave", city: "Gurgaon" },
              { name: "Lotus Garden", city: "Ahmedabad" },
              { name: "Royal Palms", city: "Mumbai" },
              { name: "Palm Heights", city: "Chennai" },
            ].map((society, index) => (
              <span key={index} className="logo-item">
                <Building2
                  className="w-4 h-4 inline-block"
                  style={{ color: "#666" }}
                />{" "}
                {society.name} · {society.city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Product Overview */}
      <section className="bg-white py-section_padding overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <p className="text-secondary font-label-caps uppercase tracking-widest mb-4">
              Every Community Needs
            </p>
            <h2 className="font-h2 text-h2 text-primary">
              Tailored Solutions for Everyone
            </h2>
          </div>
          <div className="grid lg:grid-cols-12 gap-gutter items-stretch">
            <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-10 flex flex-col justify-between group hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="max-w-md">
                <Users className="w-10 h-10 text-secondary mb-6" />
                <h3 className="font-h2 text-3xl mb-4">For RWA Committees</h3>
                <p className="text-on-surface-variant mb-8 font-body-md">
                  Streamline accounting, resolve helpdesk tickets faster, and
                  make data-driven decisions for your complex.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    Automated Dues Collection
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" /> Facility
                    Management & Booking
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" /> Verified
                    Vendor Management
                  </li>
                </ul>
              </div>
              <div className="relative mt-8 h-64 overflow-hidden rounded-lg">
                <img
                  alt="Dashboard Mockup"
                  className="w-full object-cover transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSLN90afIe8owJl7gUj377eBEXllzt9VbDemtcGouIcmS8SUdgCZSYxxsTSejFwm_FR7hD4Tb5cEPS08VBml8Bn9lRuQ1L4ZCyiHwpk-0he1YdZREK0_y3dOjuf-6ZJ-lzXlEiySc7FHUy5Hx2pjqP7rhvhpvVGQmemO6vJH0blclYJAHI6DTW_Dr0DzE5jNZyRu-VWEyIADPi7e4VDWz1NDqIzAbA430Bz-0Kj_DE4IUsacnIfguyFnuj5eIWxvd2SiIxpX0V3fw"
                />
              </div>
            </div>
            <div className="lg:col-span-5 bg-primary-container text-white rounded-xl p-10 flex flex-col justify-between group hover:shadow-2xl transition-all">
              <div>
                <User className="w-10 h-10 text-secondary mb-6" />
                <h3 className="font-h2 text-3xl mb-4">For Residents</h3>
                <p className="text-primary-fixed-dim mb-8 font-body-md">
                  Your one-stop app for security, convenience, and community
                  engagement.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />{" "}
                    One-click Guest Approval
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" /> Delivery
                    Pre-approvals
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" /> Daily
                    Help Attendance
                  </li>
                </ul>
              </div>
              <div className="relative mt-8 h-64 flex justify-center">
                <img
                  alt="Mobile Mockup"
                  className="h-full object-contain transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzBeAQxpOwNj4MVELgGAcIEMSTv1GRx21QLh8f40knMZ6HIGYRUnbQ2l10zv_YhxZImBSs5px52a5BolEwGakhOrbmnfNwjfufeLUnSOpn5UIihIWuy5PjfSq87yoNZoi3GEH8yNyjUoiA2B2W7GVBNTlacgleW6qMpf5_vQkV6XAmUdkL4jup9EL0dTCpiaT-f835V77lija6VdWf9R1CDGrCgt3e8pyAoUn1dUkE3q_tEGO8F7h8omvOjB263bhW8Qw2etLLrko"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="bg-surface py-section_padding">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-16">
            <h2 className="font-h2 text-h2 text-primary mb-4">
              Built for Every Moment
            </h2>
            <p className="text-on-surface-variant max-w-2xl font-body-lg">
              A comprehensive suite of features designed to handle the
              complexities of modern community living.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="md:col-span-4 md:row-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group overflow-hidden">
              <Fingerprint className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Visitor Management</h4>
              <p className="text-on-surface-variant mb-6">
                Real-time alerts, digital logs, and AI-powered visitor
                verification.
              </p>
              <div className="mt-4 bg-surface-container-low rounded-lg p-4 h-64">
                <img
                  alt="Security Guard"
                  className="w-full h-full object-cover rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSW4IP8EWGX2pWfaAOcDYoCq5UoayM7QRaohUNSEKBl3a-D7ugYp2zpNlQTd_hYRY7wUkFwTt5yAHnfVsw7YeI4xnnWjdBVtYkxddiIeFxlJ6OdgjIEbKcjpNsm9YUav7Wunc2nZXhw4F22WyaqusVx5gKPZ2p0fmPG3sIAeE78x06N8dPhv3kjkMGKtz_qWZFGXk-STriM4aayp9CMTIiw_vusiI3tNJ7xnaxy57gvs49eOMtMRBtB0Km9r8PcaUIW__mhG_8ZT4"
                />
              </div>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <Landmark className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Smart Accounting</h4>
              <p className="text-on-surface-variant">
                Automated billing, invoicing and GST-ready reports.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <Truck className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Delivery</h4>
              <p className="text-on-surface-variant">
                Package management and e-commerce verification.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <Headphones className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Helpdesk</h4>
              <p className="text-on-surface-variant">
                Instant complaint tracking and service reminders.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <CalendarDays className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Facility Booking</h4>
              <p className="text-on-surface-variant">
                Clubhouse, tennis court, and party hall scheduling.
              </p>
            </div>
            <div className="md:col-span-2 bg-white rounded-xl p-8 border border-surface-variant shadow-sm hover:shadow-ambient transition-all group">
              <MessageSquare className="w-9 h-9 text-secondary mb-4" />
              <h4 className="font-h2 text-2xl mb-2">Community Feed</h4>
              <p className="text-on-surface-variant">
                Notice boards, discussions, and neighborhood polls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-primary py-section_padding overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-secondary font-label-caps uppercase tracking-widest mb-4">
              Enterprise Grade Security
            </p>
            <h2 className="font-h2 text-h2 text-white mb-8">
              Uncompromising Trust for Your Home
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-h2 text-xl text-white mb-2">
                    End-to-End Encryption
                  </h4>
                  <p className="text-primary-fixed-dim">
                    All resident and visitor data is encrypted with 256-bit
                    protocols, ensuring maximum privacy.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-h2 text-xl text-white mb-2">
                    Intruder Prevention
                  </h4>
                  <p className="text-primary-fixed-dim">
                    Sophisticated block-lists and real-time facial matching at
                    the gate entrance.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-h2 text-xl text-white mb-2">
                    GDPR Compliant
                  </h4>
                  <p className="text-primary-fixed-dim">
                    We strictly follow data protection laws to give you full
                    control over your community data.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-secondary/20 rounded-2xl blur-2xl group-hover:bg-secondary/30 transition-all duration-500"></div>
            <img
              alt="Community Entrance"
              className="relative rounded-2xl shadow-2xl z-10 w-full object-cover aspect-[4/3]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZGTlEM2vszZgdU-IvlmkoVVGiQLYzxhCvnkJDlPm6Tqt9SuijxL7ZiMmAjEaVYG0AEIVM27bDg1PFKDqc3qty6j-YzUCXN82wMX18w4EWYVLXOrRhDhXwgAL_7EaZaVjlRc7axfq7TjzpNvdM-90naR2aQmm9hUgGnGfOxEQc0YXyZc1NBCH06vGhytivQPZgHC53K1EGNzZ7j8kv3Fyqzo-KKuXYXtjCqi5C3FEUtsmjOlU9bdKGFcZOxQ2hdn6SazUwFyuxfm0"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface-bright py-section_padding">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="font-h2 text-h2 text-primary mb-4">
              The Implementation Path
            </h2>
            <p className="text-on-surface-variant font-body-lg">
              Go live with MyGateBell in under 7 days.
            </p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-12">
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient border border-secondary/10 text-secondary font-bold text-xl">
                1
              </div>
              <h4 className="font-h2 text-xl mb-3">Register</h4>
              <p className="text-on-surface-variant font-body-md">
                Sign up your community and upload basic details of flats and
                owners.
              </p>
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient border border-secondary/10 text-secondary font-bold text-xl">
                2
              </div>
              <h4 className="font-h2 text-xl mb-3">Onboard</h4>
              <p className="text-on-surface-variant font-body-md">
                Our team provides on-site training for guards and digital setup
                for residents.
              </p>
            </div>
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-ambient text-white font-bold text-xl">
                3
              </div>
              <h4 className="font-h2 text-xl mb-3">Go Live</h4>
              <p className="text-on-surface-variant font-body-md">
                Switch on the smart gate and enjoy a safer, more connected
                lifestyle.
              </p>
            </div>
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-secondary/20 z-0"></div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-section_padding">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface rounded-xl p-8 shadow-sm hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="flex gap-1 text-secondary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="font-body-md text-primary mb-8 italic">
                "MyGateBell has completely changed how our RWA operates. The
                accounting feature alone saved us 40 hours of manual work every
                month."
              </p>
              <div className="flex items-center gap-4">
                <img
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3B2NSg2eeBt-SSFM0tb5f1sEuMY0UvPXE7TtGWZ0kolR2Gq88TgfYwuQPKS5u9bMGUbCIyP5j2TkvpixXQnwG5i4fTpkuLaPiRiATrkByelrLTinHRT_stFRs53zItUhJY-ygLCBE5b8tLADTKltxzwMiivDUtIpjdh5Ax8WrMZekABAibNcDonO_CXxNi0iegnc7tOzvQCIBW-4YEwbZjain9PZx9GWCqEL4qjTOQ72Uqxg4Fqpli36PhiybeiBcW3UoWjphJQQ"
                />
                <div>
                  <p className="font-bold text-sm">Anand Ranganathan</p>
                  <p className="text-xs text-on-surface-variant">
                    Secretary, Prestige Ferns
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-8 shadow-sm hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="flex gap-1 text-secondary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="font-body-md text-primary mb-8 italic">
                "As a resident, I feel much safer knowing exactly who is
                entering the building. The delivery pre-approval is a
                lifesaver!"
              </p>
              <div className="flex items-center gap-4">
                <img
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuANmU_k_r5DCwT2KKh1-RKWiIqkxwut9eeRBQX6cyD5nP85zn3ugZR_Km8FrGN9O9P97Idz79n8DBh1w4sEWaADUzhg2T5HV0YTolUerv3EEu4zAAAKcCu1cwJmeCVHolvJEPredTNCatUR9FlrWOaCtDOVrOs3htUHTSWnDEyghg1fc_Y9QiJ2yt92ZH_XAzKeyQcMrVCklge6f9bnbrzbYRmxjeyKSLkayJKT1JzHLkmdJ464xmESWQ-UuYQtLgOFLCfg0t6yMAs"
                />
                <div>
                  <p className="font-bold text-sm">Priya Sharma</p>
                  <p className="text-xs text-on-surface-variant">
                    Resident, Godrej Properties
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface rounded-xl p-8 shadow-sm hover:shadow-ambient transition-all border border-transparent hover:border-secondary/10">
              <div className="flex gap-1 text-secondary mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="font-body-md text-primary mb-8 italic">
                "The transition was seamless. Their support team was there at
                every step. Truly the new standard for Indian gated
                communities."
              </p>
              <div className="flex items-center gap-4">
                <img
                  alt="Avatar"
                  className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnGPUyJY9AuY1IioJtZJQtJ2_ezGxlUrk7YEFcOpU78ZJY7Y1l8zwqghy7FVg-6hP5NsY1MGTjpzF2sKzyQvyZ5iRsd4VpzjpG_7hwVkzS_ACTHhIqkcHLr9uIQJm0IuDZKl14sYOCaSF-ZGA0h5MJrMvUaSkw6DmfHFzec3t9gXHBb8q318EL1RQEUVaxfIRzQKjfDh5gW7FwJbJybm1UfYZQIuhuRvimfHRy4maCHlGprtGBrgehHcjI72zmdoMWJsgvXxOqG0c"
                />
                <div>
                  <p className="font-bold text-sm">Vikram Seth</p>
                  <p className="text-xs text-on-surface-variant">
                    Director, Asset Management
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section
        id="demoSection"
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40"
      >
        {/* Soft decorative blobs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-secondary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle, #0f172a 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-20 lg:py-28">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/8 border border-secondary/10 rounded-full px-5 py-2 mb-6">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-secondary text-xs font-semibold tracking-widest uppercase">
                Request a Demo
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight mb-5">
              See{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-blue-600">
                MyGateBell
              </span>{" "}
              in Action
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Request a personalized demo to see how MyGateBell can solve your
              community's unique challenges.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 items-start">
            {/* Left Column — Trust & Info */}
            <div className="lg:col-span-2 space-y-8 lg:sticky lg:top-28">
              {/* Feature cards */}
              <div className="space-y-4">
                {[
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                        />
                      </svg>
                    ),
                    title: "Data Localized in India",
                    desc: "100% compliant with Indian data privacy laws",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                        />
                      </svg>
                    ),
                    title: "Instant Visitor Alerts",
                    desc: "Get notified on your phone in under 2 seconds",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ),
                    title: "24/7 Support",
                    desc: "Round-the-clock assistance guaranteed",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                        />
                      </svg>
                    ),
                    title: "500+ Communities",
                    desc: "Trusted by societies across India",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-white border border-slate-200/80 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/5 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary/15 transition-colors">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-slate-900 text-sm font-semibold mb-0.5">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "99.9%", label: "Uptime" },
                  { value: "<2s", label: "Response" },
                  { value: "4.8★", label: "Rating" },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="text-center py-4 rounded-xl bg-white border border-slate-200/80 shadow-sm"
                  >
                    <div className="text-secondary font-extrabold text-lg leading-none mb-1">
                      {stat.value}
                    </div>
                    <div className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social proof quote */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-secondary/5 to-blue-500/5 border border-secondary/10">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed italic mb-3">
                  "MyGateBell transformed our gate management. Visitor tracking
                  is now seamless and security has improved dramatically."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    RK
                  </div>
                  <div>
                    <div className="text-slate-800 text-xs font-semibold">
                      Rajesh Kumar
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Secretary, Prestige Shantiniketan
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xl shadow-slate-200/50">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
                    <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                      Request Submitted!
                    </h3>
                    <p className="text-slate-500 max-w-sm leading-relaxed">
                      We'll get back to you within 24 hours. Check your email
                      for confirmation.
                    </p>
                  </div>
                ) : (
                  <form className="space-y-7" onSubmit={handleSubmit}>
                    {error && (
                      <div className="flex items-start gap-3 bg-red-50 border border-red-200/80 rounded-xl px-4 py-3.5 animate-fade-in">
                        <svg
                          className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                          />
                        </svg>
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    )}

                    {/* ── Society Details ── */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-slate-900 text-sm font-bold">
                            Society Details
                          </h3>
                          <p className="text-slate-400 text-xs">
                            Information about your community
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Society / Community Name{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="e.g. Ferns City"
                            type="text"
                            name="societyName"
                            value={form.societyName}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Address
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="Street / locality"
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="e.g. Bengaluru"
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            State
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="e.g. Karnataka"
                            type="text"
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Pincode
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="560001"
                            type="text"
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Towers
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="1"
                            type="number"
                            min="1"
                            name="towers"
                            value={form.towers}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Total Flats
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="100"
                            type="number"
                            min="0"
                            name="totalFlats"
                            value={form.totalFlats}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* ── Contact Details ── */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-secondary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-slate-900 text-sm font-bold">
                            Contact Details
                          </h3>
                          <p className="text-slate-400 text-xs">
                            How we can reach you
                          </p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Contact Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="Your full name"
                            type="text"
                            name="contactName"
                            value={form.contactName}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="you@example.com"
                            type="email"
                            name="contactEmail"
                            value={form.contactEmail}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="+91 98765 43210"
                            type="tel"
                            name="contactPhone"
                            value={form.contactPhone}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            GST Number
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="Optional"
                            type="text"
                            name="gst"
                            value={form.gst}
                            onChange={handleChange}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            PAN Number
                          </label>
                          <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all"
                            placeholder="Optional"
                            type="text"
                            name="pan"
                            value={form.pan}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                            Message
                          </label>
                          <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary/40 transition-all resize-none"
                            placeholder="Any specific requirements or questions..."
                            rows={3}
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="group relative w-full py-4 px-6 rounded-xl font-bold text-sm text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-secondary/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-blue-600 group-hover:from-secondary group-hover:to-secondary transition-all duration-500" />
                        <span className="relative flex items-center justify-center gap-2">
                          {submitting ? (
                            <>
                              <svg
                                className="animate-spin w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            <>
                              Submit Request
                              <svg
                                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                                />
                              </svg>
                            </>
                          )}
                        </span>
                      </button>

                      <p className="text-center text-slate-400 text-xs mt-4">
                        By submitting, you agree to our Terms of Service &
                        Privacy Policy
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Download Banner */}
      <section className="bg-secondary-container py-section_padding">
        <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-white">
            <h2 className="font-h2 text-h2 mb-6">Security in Your Pocket</h2>
            <p className="font-body-lg mb-10 opacity-90">
              Download the MyGateBell app today and start enjoying a smarter,
              more secure lifestyle for you and your family.
            </p>
            <div className="flex flex-wrap gap-4 mb-12">
              <a href="#">
                <img
                  alt="App Store"
                  className="h-12"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8sUk-jIMHiaqovURWGQ-zCETOvvgIw771nGxTcPzkWcMrODZ7HH57TSsCG_b5WfOtf14SRDmvpipKbE9PbhxxVOBssGXGnBV7BAqfWTm8K8D0cRYBneciigs2EEHOoTC2OWgjC73GUnvprhM1QGVbLAVLoB4BziX3oDFVXRXHZVSukhcalerX5ICaLH1XPUhhXLrnTZ7wZxb5d71wF8sJR_rzArpLSgooP93sHSeBKsXD6VzUDAUb1dv1jXXB3vAYs2VpS40gWKM"
                />
              </a>
              <a href="#">
                <img
                  alt="Play Store"
                  className="h-12"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApFxMkJen5RhcwPDFQ1iJOwiGkQFF9jK77WjrDKsHb8G6epWX61je3-UYvD6aueU1ZgypYlnT-mMjRYyOsdy6AI7gOxVRqTQfahe0ml9GlZicqgi7L0iSp7dObMdat0ZA5p3HwoEgmGeRE4lCQQMh3maK9veG3xC7rDh_tQ-0RHs_YwL9Rb85Ju60odGJOwoUzCMK3y5ftNl1nD5QDxmj6N9xB3tVY7OlSpuqB6YoG8HVj7DSZK_-IgIlZZgobnUg3AaKSLCgiFRY"
                />
              </a>
            </div>
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white rounded-xl">
                <div className="w-24 h-24 bg-gray-100 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-primary" />
                </div>
              </div>
              <p className="text-sm">
                Scan the QR code
                <br />
                <span className="font-bold">to download instantly</span>
              </p>
            </div>
          </div>
          <div className="relative flex justify-center items-end">
            <div className="relative w-full max-w-sm">
              <img
                alt="Phone App"
                className="rounded-[40px] border-[8px] border-white shadow-2xl"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDAVl3umnXyU8w621M_2cx2766CUP07yAcgQKVNudjWsHxwn_6v_RN79Cjb1YQO6Vp7VrAr54ihhVed_KZqNAiQLC57oMeKHFgSnsj1qgNN33-Oe31JbETASJUUMxvXTO5oWiFjxTKQ0NNzXdXFT-S7MI7UqFwleqvEOdN2LdcQwabKydDiKA122K0c8o3ea3hv8No2DtYet92hnJW5wcLyPwXdZpacVmpjKiPh9pRfqm-wq8AxLKzTlNR9D9qwShzLntR-tDmP5cI"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
