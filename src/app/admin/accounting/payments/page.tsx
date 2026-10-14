"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminAccountingPaymentsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/accounting?tab=overview");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-6 bg-white rounded-xl shadow-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Redirecting to Accounting & Payments...</p>
      </div>
    </div>
  );
}
