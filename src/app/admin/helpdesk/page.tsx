"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Construction } from "lucide-react";

export default function HelpdeskAdmin() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Helpdesk Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-12 text-center flex flex-col items-center justify-center">
          <Construction className="w-24 h-24 text-gray-300 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-500 max-w-md">
            The Helpdesk management module is currently under construction. Please check back later for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
