import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle2 } from "lucide-react";
import type { AgentReply } from "@/hooks/useAgentReplies";
import { cn } from "@/lib/utils";

const dtf = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

function relativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = diffMs / 3_600_000;
  if (hours < 1) {
    const mins = Math.max(1, Math.round(diffMs / 60_000));
    return rtf.format(-mins, "minute");
  }
  if (hours < 24) return rtf.format(-Math.round(hours), "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

export default function AgentReplyCard({ reply }: { reply: AgentReply }) {
  const displayName = reply.senderEmail;

  return (
    <Card className="border-l-4 border-l-emerald-500 transition-colors hover:border-primary/40">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-sm font-medium truncate">
              <Mail size={14} className="text-muted-foreground shrink-0" />
              <span className="truncate">{displayName}</span>
            </div>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[11px] font-medium">
            <CheckCircle2 size={11} />
            Replied
          </span>
        </div>

        <div className="space-y-1">
          <p className="font-semibold text-sm leading-snug line-clamp-1">
            {reply.subject || "(no subject)"}
          </p>
          <p className="text-xs text-muted-foreground">
            AI sent a reply to this email.
          </p>
        </div>

        <div className="pt-1 border-t border-border/50 flex items-center justify-between gap-2">
          <span className="text-[11px] text-muted-foreground">
            {relativeTime(reply.createdAt)} · {dtf.format(new Date(reply.createdAt))}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
