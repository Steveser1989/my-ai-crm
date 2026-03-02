"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SocialHandles } from "@/modules/contacts/components/SocialHandles";
import {
  ArrowLeft, Mail, Phone, Building2, Globe, MapPin,
  Calendar, DollarSign, MessageSquare, Bot, FileText
} from "lucide-react";

interface ContactProfileProps {
  contact: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    title: string | null;
    avatar_url: string | null;
    address: string | null;
    website: string | null;
    notes: string | null;
    contact_social_handles: Array<{ id: string; platform: string; handle: string }>;
    contact_documents: Array<{ id: string; file_url: string; file_name: string; file_type: string }>;
  };
  activities: Array<{ id: string; type: string; title: string; description: string | null; scheduled_at: string | null; completed_at: string | null; created_at: string }>;
  deals: Array<{ id: string; title: string; value: number | null; currency: string; status: string; pipeline_stages: { name: string } | null }>;
  communications: Array<{ id: string; channel: string; direction: string; content: string; created_at: string }>;
}

export function ContactProfile({ contact, activities, deals, communications }: ContactProfileProps) {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Button asChild variant="ghost" size="sm" className="mt-1">
          <Link href="/dashboard/contacts">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Contacts
          </Link>
        </Button>
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-lg">
              {contact.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{contact.name}</h1>
            {contact.title && contact.company && (
              <p className="text-slate-500 text-sm">{contact.title} at {contact.company}</p>
            )}
          </div>
          <div className="ml-auto flex gap-2">
            <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              <Link href={`/dashboard/ai-advisor?contact=${contact.id}`}>
                <Bot className="h-4 w-4 mr-2" />
                AI Advisor
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Social Handles */}
      {contact.contact_social_handles.length > 0 && (
        <SocialHandles handles={contact.contact_social_handles} contactPhone={contact.phone} />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
          <TabsTrigger value="deals">Deals ({deals.length})</TabsTrigger>
          <TabsTrigger value="communications">Messages ({communications.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({contact.contact_documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card className="border-slate-200">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-indigo-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-slate-700 hover:text-indigo-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    {contact.phone}
                  </a>
                )}
                {contact.company && (
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {contact.company}
                  </span>
                )}
                {contact.website && (
                  <a href={contact.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-slate-700 hover:text-indigo-600">
                    <Globe className="h-4 w-4 text-slate-400" />
                    {contact.website}
                  </a>
                )}
                {contact.address && (
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {contact.address}
                  </span>
                )}
              </div>
              {contact.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No activities yet</p>
              ) : activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800">{act.title}</p>
                    {act.description && <p className="text-xs text-slate-500">{act.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">
                      {act.type} · {new Date(act.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {act.completed_at && <Badge className="bg-green-100 text-green-700 text-xs">Done</Badge>}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              {deals.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No deals yet</p>
              ) : deals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{deal.title}</p>
                    <p className="text-xs text-slate-500">{deal.pipeline_stages?.name ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {deal.value && (
                      <span className="text-sm font-semibold text-green-600">
                        {deal.currency} {Number(deal.value).toLocaleString()}
                      </span>
                    )}
                    <Badge variant={deal.status === "open" ? "default" : "secondary"} className="text-xs">
                      {deal.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-3">
              {communications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No messages yet</p>
              ) : communications.map((comm) => (
                <div key={comm.id} className={`flex ${comm.direction === "outbound" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    comm.direction === "outbound" ? "bg-indigo-100 text-indigo-900" : "bg-slate-100 text-slate-800"
                  }`}>
                    <p>{comm.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {comm.channel} · {new Date(comm.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="border-slate-200">
            <CardContent className="p-4 space-y-2">
              {contact.contact_documents.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No documents uploaded</p>
              ) : contact.contact_documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{doc.file_name}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{doc.file_type}</Badge>
                </a>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
