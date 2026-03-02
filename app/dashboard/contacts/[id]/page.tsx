import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ContactProfile } from "@/modules/contacts/views/ContactProfileView";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contact } = await supabase
    .from("contacts")
    .select("*, contact_social_handles(*), contact_documents(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!contact) notFound();

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: deals } = await supabase
    .from("deals")
    .select("*, pipeline_stages(name)")
    .eq("contact_id", id)
    .order("created_at", { ascending: false });

  const { data: comms } = await supabase
    .from("communications")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <ContactProfile
      contact={contact}
      activities={activities ?? []}
      deals={deals ?? []}
      communications={comms ?? []}
    />
  );
}
