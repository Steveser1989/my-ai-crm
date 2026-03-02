"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Tag, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PromoCode {
  id: string;
  code: string;
  credits: number;
  uses: number;
  maxUses: number;
  active: boolean;
}

export default function PromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[]>([
    { id: "1", code: "WELCOME500", credits: 500, uses: 42, maxUses: 100, active: true },
    { id: "2", code: "LAUNCH2024", credits: 1000, uses: 15, maxUses: 50, active: false },
  ]);
  const [newCode, setNewCode] = useState("");
  const [newCredits, setNewCredits] = useState("");
  const [newMax, setNewMax] = useState("");
  const [creating, setCreating] = useState(false);

  async function createCode() {
    if (!newCode || !newCredits) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 800));
    setCodes((c) => [...c, {
      id: Date.now().toString(),
      code: newCode.toUpperCase(),
      credits: parseInt(newCredits),
      uses: 0,
      maxUses: parseInt(newMax || "999"),
      active: true,
    }]);
    setNewCode("");
    setNewCredits("");
    setNewMax("");
    setCreating(false);
    toast.success("Promo code created");
  }

  function removeCode(id: string) {
    setCodes((c) => c.filter((x) => x.id !== id));
    toast.success("Code removed");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-xl font-bold text-slate-900">Promo Codes</h1>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" />Create Promo Code</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Code</Label>
              <Input placeholder="WELCOME500" value={newCode} onChange={(e) => setNewCode(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Credits to Grant</Label>
              <Input type="number" placeholder="500" value={newCredits} onChange={(e) => setNewCredits(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max Uses (0 = unlimited)</Label>
              <Input type="number" placeholder="100" value={newMax} onChange={(e) => setNewMax(e.target.value)} />
            </div>
          </div>
          <Button onClick={createCode} disabled={creating || !newCode || !newCredits} className="mt-3 bg-indigo-600 hover:bg-indigo-700">
            {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Tag className="h-4 w-4 mr-2" />}
            Create Code
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base">Active Codes</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Uses / Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium text-sm">{c.code}</TableCell>
                  <TableCell className="text-sm">{c.credits.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{c.uses} / {c.maxUses}</TableCell>
                  <TableCell>
                    <Badge className={c.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}>
                      {c.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <button onClick={() => removeCode(c.id)} className="text-red-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
