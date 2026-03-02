import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BillingSuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <CheckCircle className="h-16 w-16 text-green-500" />
      <h1 className="text-2xl font-bold text-slate-900">Payment Successful!</h1>
      <p className="text-slate-500 text-center max-w-md">
        Your credits have been added to your account. They may take a minute to appear.
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/billing">View Billing</Link>
        </Button>
      </div>
    </div>
  );
}
