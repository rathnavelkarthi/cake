import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";
import { AdminProviders } from "@/components/admin/providers";
import { InternalTeamChatWidget } from "@/components/admin/InternalTeamChatWidget";
import AdminNotificationProvider from "@/components/admin/AdminNotificationProvider";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <AdminProviders session={session}>
      <div className="min-h-screen bg-stone-50/60 flex flex-col font-sans text-stone-900">
        <AdminSidebar />
        <div className="flex flex-1 flex-col sm:pl-64">
          <AdminHeader user={session.user} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
        {/* Floating Internal Bakery Team Chat for all admin pages */}
        <InternalTeamChatWidget />
        {/* Sound + browser push notifications for orders and chat */}
        <AdminNotificationProvider />
      </div>
    </AdminProviders>
  );
}
