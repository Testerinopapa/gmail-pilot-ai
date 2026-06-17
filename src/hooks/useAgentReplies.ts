import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const SEND_SMART_URL =
  "https://uexdjvbdqwrzlgfrpgbl.supabase.co/functions/v1/usage-get";
const SEND_SMART_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleGRqdmJkcXdyemxnZnJwZ2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2NzE2NDEsImV4cCI6MjA5MDI0NzY0MX0.-BAr2q1F_2Kn-v0foNSfSvuRbGEnaom_kPZI-r7f6Nw";

export interface AgentReply {
  createdAt: string;
  subject: string;
  senderEmail: string;
  decision: string;
}

interface UsageResponse {
  recent: AgentReply[];
}

const REPLY_DECISIONS = new Set(["replied", "reply", "sent", "auto_replied", "auto-send"]);

export function useAgentReplies() {
  const query = useQuery<AgentReply[]>({
    queryKey: ["agent-replies"],
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (failureCount >= 3) return false;
      const msg = (error as Error)?.message ?? "";
      return /\b(5\d\d|temporarily unavailable|network)\b/i.test(msg);
    },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not signed in");
      }

      let lastErr: Error | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        const res = await fetch(SEND_SMART_URL, {
          method: "GET",
          headers: {
            apikey: SEND_SMART_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = (await res.json()) as UsageResponse;
          return (data.recent ?? []).filter((r) =>
            REPLY_DECISIONS.has(r.decision?.toLowerCase() ?? "")
          );
        }

        let message = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
          else if (body?.message) message = body.message;
        } catch {
          // ignore
        }
        lastErr = new Error(message);

        if (res.status < 500) throw lastErr;
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
      throw lastErr ?? new Error("Request failed");
    },
  });

  return {
    replies: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
