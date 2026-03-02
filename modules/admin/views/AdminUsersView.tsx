"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Shield, Zap, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface UserData {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  subscription: { status: string; plan_id: string | null } | null;
  balance: number;
}

export function AdminUsersClient({ users }: { users: UserData[] }) {
  const [search, setSearch] = useState("");
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("");

  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.id.includes(search)
  );

  async function toggleAdmin(userId: string, current: boolean) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, is_admin: !current }),
    });
    if (res.ok) toast.success(`Admin ${!current ? "granted" : "revoked"}`);
    else toast.error("Failed to update");
  }

  async function adjustCredits(userId: string) {
    const amount = parseInt(adjustAmount);
    if (isNaN(amount)) { toast.error("Enter a valid number"); return; }
    const res = await fetch("/api/admin/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, amount }),
    });
    if (res.ok) {
      toast.success(`${amount > 0 ? "+" : ""}${amount} credits applied`);
      setAdjustUserId(null);
      setAdjustAmount("");
    } else toast.error("Failed to adjust credits");
  }

  return (
    <Card className="border-slate-200">
      <CardContent className="p-0">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-800">{user.full_name ?? "—"}</p>
                    <p className="text-xs text-slate-400">{user.id.slice(0, 8)}...</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.subscription?.status === "active" ? "default" : "secondary"}
                    className={user.subscription?.status === "active" ? "bg-green-100 text-green-700" : ""}>
                    {user.subscription?.status ?? "free"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="flex items-center gap-1 text-sm">
                    <Zap className="h-3 w-3 text-amber-500" />
                    {user.balance.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {format(new Date(user.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {user.is_admin ? (
                    <Badge className="bg-amber-100 text-amber-700 flex items-center gap-1 w-fit">
                      <Shield className="h-3 w-3" />Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">User</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleAdmin(user.id, user.is_admin)}>
                      {user.is_admin ? "Revoke Admin" : "Make Admin"}
                    </Button>
                    {adjustUserId === user.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          className="w-24 h-7 text-xs"
                          placeholder="+/- credits"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                        />
                        <Button size="sm" className="h-7 text-xs" onClick={() => adjustCredits(user.id)}>Apply</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdjustUserId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setAdjustUserId(user.id)}>
                        <Plus className="h-3 w-3 mr-1" />
                        Credits
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
