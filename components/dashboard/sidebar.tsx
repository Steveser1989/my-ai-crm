"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  BrainCircuit,
  Users,
  Package,
  MessageSquare,
  Bot,
  LayoutDashboard,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/communications", label: "Communications", icon: MessageSquare },
  { href: "/dashboard/ai-advisor", label: "AI Advisor", icon: Bot },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/support", label: "Support", icon: HelpCircle },
];

export function Sidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [collapsed, setCollapsed] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center gap-2 p-4 border-b border-slate-800", collapsed && "justify-center")}>
        <BrainCircuit className="h-6 w-6 text-indigo-400 flex-shrink-0" />
        {!collapsed && <span className="font-bold text-white text-lg">My AI CRM</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-amber-400 hover:text-amber-300 hover:bg-slate-800",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Admin Panel" : undefined}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* Bottom controls */}
      <div className="p-2 border-t border-slate-800 space-y-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={cn(
            "w-full text-slate-400 hover:text-white hover:bg-slate-800",
            collapsed ? "justify-center px-2" : "justify-start gap-3"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && "Sign Out"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-slate-600 hover:text-slate-400 hover:bg-slate-800 justify-center"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
