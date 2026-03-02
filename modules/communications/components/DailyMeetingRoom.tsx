"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Video, FileText, Loader2, Copy, ExternalLink, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function DailyMeetingRoom() {
  const [roomUrl, setRoomUrl] = useState("");
  const [contactId, setContactId] = useState("");
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [mom, setMom] = useState("");
  const [generatingMom, setGeneratingMom] = useState(false);
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    setCreating(true);
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact_id: contactId || null }),
    });
    setCreating(false);
    if (!res.ok) { toast.error("Failed to create meeting room"); return; }
    const data = await res.json();
    setRoomUrl(data.room_url);
    setIsInMeeting(true);
    toast.success("Meeting room created!");
  }

  async function generateMom() {
    if (!transcript) { toast.error("Add a transcript first"); return; }
    setGeneratingMom(true);
    const res = await fetch("/api/meetings/mom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, contact_id: contactId || null }),
    });
    setGeneratingMom(false);
    if (!res.ok) { toast.error("Failed to generate MOM"); return; }
    const data = await res.json();
    setMom(data.mom);
    toast.success("Minutes of Meeting generated and saved to contact profile!");
  }

  async function endMeeting() {
    setIsInMeeting(false);
    toast.info("Meeting ended. Add transcript above to generate MOM.");
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="h-4 w-4 text-indigo-600" />
            Daily.co Video Meeting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isInMeeting ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Contact ID (optional)</Label>
                <Input
                  placeholder="Link meeting to a contact"
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={createRoom} disabled={creating}>
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                  Create Meeting Room
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder="Or paste an existing Daily.co room URL"
                    value={roomUrl}
                    onChange={(e) => setRoomUrl(e.target.value)}
                  />
                </div>
                {roomUrl && (
                  <Button onClick={() => setIsInMeeting(true)}>Join</Button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Powered by <a href="https://daily.co" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">daily.co</a>.
                Requires DAILY_API_KEY in your environment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-700">Live Meeting</Badge>
                <span className="text-sm text-slate-600 truncate flex-1">{roomUrl}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(roomUrl);
                    toast.success("Link copied!");
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={roomUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </a>
                </Button>
              </div>

              {/* Embedded iframe */}
              <div className="rounded-lg overflow-hidden border border-slate-200" style={{ height: 400 }}>
                <iframe
                  src={roomUrl}
                  allow="camera; microphone; fullscreen; speaker; display-capture"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="Daily.co Meeting Room"
                />
              </div>

              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={endMeeting}>
                End Meeting
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Transcript & MOM */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            Minutes of Meeting (MOM)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Meeting Transcript</Label>
            <Textarea
              rows={5}
              placeholder="Paste meeting transcript here, or it will be auto-populated from Whisper transcription..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
          <Button onClick={generateMom} disabled={generatingMom || !transcript} className="bg-purple-600 hover:bg-purple-700">
            {generatingMom ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate MOM with AI
          </Button>
          {mom && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>Generated MOM</Label>
                <Badge className="bg-green-100 text-green-700 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved to contact
                </Badge>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{mom}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
