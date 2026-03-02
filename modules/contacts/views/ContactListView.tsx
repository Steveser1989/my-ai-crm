"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Download, Search, Mail, Phone, Building2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const PLATFORM_COLORS: Record<string, string> = {
  whatsapp: "bg-green-100 text-green-700",
  telegram: "bg-blue-100 text-blue-700",
  wechat: "bg-green-200 text-green-800",
  line: "bg-green-300 text-green-900",
  discord: "bg-indigo-100 text-indigo-700",
  slack: "bg-purple-100 text-purple-700",
  messenger: "bg-blue-200 text-blue-800",
  facebook: "bg-blue-300 text-blue-900",
};

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  avatar_url: string | null;
  contact_social_handles: Array<{ id: string; platform: string; handle: string }>;
}

export function ContactListClient({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
  );

  function handleExport() {
    const rows = contacts.map((c) => ({
      Name: c.name,
      Email: c.email ?? "",
      Phone: c.phone ?? "",
      Company: c.company ?? "",
      Title: c.title ?? "",
      ...Object.fromEntries(
        c.contact_social_handles.map((h) => [h.platform, h.handle])
      ),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, "my-ai-crm-contacts.xlsx");
    toast.success("Contacts exported");
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

    let imported = 0;
    for (const row of rows) {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.Name || row.name || "Unknown",
          email: row.Email || row.email || null,
          phone: row.Phone || row.phone || null,
          company: row.Company || row.company || null,
          title: row.Title || row.title || null,
        }),
      });
      if (res.ok) {
        const contact = await res.json();
        setContacts((prev) => [contact, ...prev]);
        imported++;
      }
    }
    toast.success(`Imported ${imported} contacts`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-4 w-4 mr-2" />
          Import Excel
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((contact) => (
          <Link key={contact.id} href={`/dashboard/contacts/${contact.id}`}>
            <Card className="border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold text-sm">
                      {contact.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{contact.name}</p>
                    {contact.title && contact.company && (
                      <p className="text-xs text-slate-500 truncate">{contact.title} · {contact.company}</p>
                    )}
                    {contact.email && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </p>
                    )}
                    {contact.phone && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                        <Phone className="h-3 w-3" />
                        {contact.phone}
                      </p>
                    )}
                    {contact.contact_social_handles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contact.contact_social_handles.slice(0, 3).map((h) => (
                          <Badge
                            key={h.id}
                            variant="secondary"
                            className={`text-xs ${PLATFORM_COLORS[h.platform] ?? "bg-slate-100 text-slate-600"}`}
                          >
                            {h.platform}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-400">
            <p>No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
}
