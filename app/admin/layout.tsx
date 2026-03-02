export const dynamic = 'force-dynamic';

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BrainCircuit, Settings, LogOut } from "lucide-react";

const ADMIN_TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/token-usage", label: "Token Usage" },
  { href: "/admin/notifications", label: "Notifications" },
  { href: "/admin/api-keys", label: "API Keys" },
  { href: "/admin/affiliates", label: "Affiliates" },
  { href: "/admin/support", label: "Support" },
  { href: "/admin/promo-codes", label: "Promo Codes" },
  { href: "/admin/stripe-settings", label: "Stripe Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const profile = profileData as { is_admin: boolean } | null;
  if (!profile?.is_admin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin top bar */}
      <header className="bg-slate-900 text-white">
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-400" />
            <span className="font-bold">My AI CRM</span>
            <span className="text-slate-500 mx-2">|</span>
            <Settings className="h-4 w-4 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm">Admin Panel</span>
          </div>
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <LogOut className="h-3.5 w-3.5" />
            Back to CRM
          </Link>
        </div>

        {/* Tab navigation */}
        <nav className="max-w-[1400px] mx-auto px-6 flex items-center gap-1 overflow-x-auto">
          {ADMIN_TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="px-4 py-3 text-sm text-slate-300 hover:text-white border-b-2 border-transparent hover:border-indigo-400 transition-colors whitespace-nowrap"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
