import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Upload, Download, User } from "lucide-react";
import { ContactListClient } from "@/modules/contacts/views/ContactListView";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*, contact_social_handles(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">{contacts?.length ?? 0} contacts in your CRM</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/dashboard/contacts/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Link>
          </Button>
        </div>
      </div>
      <ContactListClient initialContacts={contacts ?? []} />
    </div>
  );
}
