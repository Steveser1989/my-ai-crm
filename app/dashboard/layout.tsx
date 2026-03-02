export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCreditBalance } from "@/lib/credits/balance";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const balance = await getCreditBalance(user.id);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar isAdmin={profile?.is_admin ?? false} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header creditBalance={balance} userEmail={user.email} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
