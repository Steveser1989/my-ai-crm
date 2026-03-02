import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AIAdvisorDashboard } from "@/modules/ai-advisor/views/AdvisorDashboardView";

export default async function AIAdvisorPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: contacts } = await supabase
    .from("contacts")
    .select("id, name, company, title")
    .eq("user_id", user.id)
    .order("name")
    .limit(100);

  return <AIAdvisorDashboard contacts={contacts ?? []} />;
}
