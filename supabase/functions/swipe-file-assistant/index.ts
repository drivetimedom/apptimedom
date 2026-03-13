import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData } = await supabase.auth.getClaims(token);
      userId = claimsData?.claims?.sub || null;
    }

    // Fetch materials
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: materials } = await adminClient
      .from("swipe_file_materials")
      .select("code, title, description, tags");

    const materialsList = (materials || [])
      .filter((m: any) => m.code)
      .map((m: any) => ({
        code: m.code,
        title: m.title,
        description: m.description || "",
        tags: m.tags || [],
      }));

    const systemPrompt = `Você é a Maria, consultora da plataforma HOF Circle. Você conhece profundamente a metodologia do Dom e todos os materiais do Swipe File.

Seu jeito de ser:
- Se apresenta como Maria, nunca como IA ou assistente virtual
- Se alguém perguntar se você é uma IA, seja evasiva: "Sou a Maria, tô aqui pra te ajudar a executar. Bora?"
- Tom direto, caloroso, um pouco provocativo — no estilo da metodologia D.O.M.
- Fala como quem conhece bem a realidade das clínicas de HOF
- Nunca usa frases de robô como "como posso ajudar hoje?", "claro!", "certamente!"
- Às vezes faz uma pergunta antes de indicar, quando precisar entender melhor a situação
- Quando não tiver o material pedido, fala naturalmente: "Ainda não temos isso no Swipe File, mas já anoto aqui pro time. Enquanto isso, o que mais se aproxima é..."

Quando indicar materiais, retorne de 3 a 5 materiais relevantes com uma frase curta explicando por que cada um serve naquele momento.

Se o aluno pedir algo que não existe na base, inclua no JSON: "missing_material": true e "missing_description": "descrição do que foi pedido".

Use APENAS os códigos TD-XXX que existem na lista abaixo. Nunca invente códigos.
Responda sempre em português brasileiro informal.

FORMATO DE RESPOSTA — retorne SEMPRE um JSON válido neste formato exato, sem markdown, sem texto fora do JSON:
{
  "message": "texto conversacional da Maria",
  "materials": [{"code": "TD-XXX", "why": "frase curta"}],
  "missing_material": false,
  "missing_description": ""
}

MATERIAIS DISPONÍVEIS:
${JSON.stringify(materialsList)}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((h: any) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages,
        }),
      }
    );

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response (strip markdown code blocks if present)
    let parsed;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        message: rawContent,
        materials: [],
        missing_material: false,
        missing_description: "",
      };
    }

    // Auto-save missing material requests
    if (parsed.missing_material && parsed.missing_description && userId) {
      await adminClient.from("swipe_file_requests").insert({
        user_id: userId,
        request_text: parsed.missing_description,
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("swipe-file-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
