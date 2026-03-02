"use client";

import { Bell, Search, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface HeaderProps {
  creditBalance: number;
  userEmail?: string;
}

function CreditBadge({ balance }: { balance: number }) {
  const color =
    balance === 0
      ? "bg-slate-500 text-slate-100"
      : balance < 1000
      ? "bg-red-500 text-white"
      : balance < 10000
      ? "bg-orange-500 text-white"
      : "bg-green-600 text-white";

  const label =
    balance === 0
      ? "0 credits"
      : balance >= 1000
      ? `${(balance / 1000).toFixed(1)}k credits`
      : `${balance} credits`;

  return (
    <Link href="/dashboard/billing">
      <Badge className={cn("flex items-center gap-1 cursor-pointer hover:opacity-90 transition-opacity", color)}>
        <Zap className="h-3 w-3" />
        {label}
      </Badge>
    </Link>
  );
}

export function Header({ creditBalance, userEmail }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts, products, deals..."
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white h-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <CreditBadge balance={creditBalance} />
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
        </Button>
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
          {userEmail?.[0]?.toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
