import { NewContactForm } from "@/modules/contacts/views/NewContactView";

export default function NewContactPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Contact</h1>
        <p className="text-slate-500 text-sm mt-1">Add a new contact manually or scan a business card</p>
      </div>
      <NewContactForm />
    </div>
  );
}
