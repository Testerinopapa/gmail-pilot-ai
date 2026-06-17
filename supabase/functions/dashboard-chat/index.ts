// Dashboard chat assistant — read-only AI analyst of the dashboard DOM context.
// Uses Lovable AI Gateway (no API key needed beyond LOVABLE_API_KEY).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are a read-only dashboard analyst for the Send Smart / GAutoReply Gmail dashboard.

You can ONLY see the text the user pastes from their dashboard context. You cannot modify any data, send emails, or call any tools. You only read and report.

The dashboard contains:
- Agent replies — emails the AI has already sent replies to (sender, subject, when)
- Flagged emails awaiting review (sender, subject, intent: support / complaint / appointment / misc)
- Account status, usage counters, quotas
- Extension pairing status
- Download/install steps and help

Be concise, factual, and only describe what is actually present in the dashboard context. If something is unclear or missing, say so. Never invent data.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, dashboardContext } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const contextBlock = dashboardContext
      ? `\n\n--- DASHBOARD CONTEXT (visible text on the user's screen) ---\n${String(dashboardContext).slice(0, 15000)}\n--- END DASHBOARD CONTEXT ---`
      : "";

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}${contextBlock}` },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: String(m.content ?? ""),
          })),
        ],
      }),
    });

    if (!upstream.ok) {
      const txt = await upstream.text();
      console.error("AI gateway error", upstream.status, txt);
      if (upstream.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (upstream.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up Lovable AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await upstream.json();
    const reply: string =
      data?.choices?.[0]?.message?.content ?? "Sorry, I couldn't analyze the dashboard right now.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("dashboard-chat error", err);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
