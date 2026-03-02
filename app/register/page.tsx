"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BrainCircuit, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account created! Check your email to verify.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-white">
          <div className="flex items-center gap-2 text-2xl font-bold">
            <BrainCircuit className="h-8 w-8 text-indigo-400" />
            My AI CRM
          </div>
          <p className="text-slate-400 text-sm">Start your 14-day free trial</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Create account</CardTitle>
            <CardDescription className="text-slate-400">Join My AI CRM and supercharge your sales</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Account
              </Button>
              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
