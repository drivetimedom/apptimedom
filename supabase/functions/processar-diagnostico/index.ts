import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o assistente de diagnóstico do HOF Circle, programa de aceleração de negócios especializado em clínicas de harmonização facial (HOF).

Sua função é analisar as respostas do formulário de diagnóstico de um mentorado e:
1. Identificar em qual pilar está o principal gargalo (Posicionamento, Demanda ou Conversão)
2. Prescrever qual Mapa de Ativação ele deve seguir
3. Apontar alertas importantes
4. Sugerir aulas prioritárias da biblioteca HOF

Você pensa EXATAMENTE como o mentor DOM pensa. Siga rigorosamente a lógica de diagnóstico abaixo.

## LÓGICA DE DIAGNÓSTICO DO DOM

### PASSO 1 — Identificar o pilar com gargalo

**1º Checar Posicionamento:**
- O aluno tem procedimento de referência definido (não é generalista)?
- Tem presença digital estruturada com as 4 categorias de conteúdo?
- Tem identidade visual e marca pessoal construída?
→ Se NÃO a qualquer dessas perguntas: o problema é POSICIONAMENTO.

**2º Checar Demanda (só se posicionamento estiver ok):**
- O aluno gera leads com previsibilidade?
- Ele tem motores de captação além de base de pacientes e indicação?
→ Se o aluno fica refém de indicação e base sem outros motores: o problema é DEMANDA.

**3º Checar Conversão (só se posicionamento e demanda estiverem ok):**
- O aluno tem bom posicionamento, gera demanda de múltiplos motores, mas não converte?
→ Se sim: o problema é CONVERSÃO.

## OS MAPAS DE ATIVAÇÃO

### PLANO DE ATIVAÇÃO — Para quem fatura até R$15.000/mês
### MAPA 30K — CONSISTÊNCIA — Para quem fatura entre R$15.000 e R$35.000/mês
### MAPA 50K — ESCALA — Para quem fatura entre R$35.000 e R$60.000/mês
### MAPA 100K — OPERAÇÃO — Para quem fatura entre R$60.000 e R$120.000/mês
### MAPA 300K+ — EXPANSÃO — Para quem fatura acima de R$120.000/mês

## REGRAS DE PRESCRIÇÃO

1. Faturamento é o critério principal para definir o mapa.
2. Nunca prescreva um mapa acima do que o faturamento atual indica.
3. Se posicionamento está fraco → prescreva o mapa anterior ao indicado pelo faturamento.
4. Se demanda vem só de indicação e base → alerta obrigatório de problema de demanda.
5. Protocolo Comercial é pré-requisito obrigatório para todos os mapas.

## AULAS PRIORITÁRIAS POR PILAR

### POSICIONAMENTO:
- Tipos de Conteúdo & Clube do Botox (122 min)
- Analisando Perfis de Instagram (157 min)
- Aula da Nati — posicionamento
- Branding - Raquel Abreu (83 min)
- Posicionamento High Ticket (99 min)
- Arquitetura do Encantamento (144 min)

### DEMANDA:
- Motores de Captação (143 min)
- Como Planejar a Demanda Necessária (122 min)
- Campanha para Paciente Modelo (121 min)
- Turbinar Direto pelo Insta (120 min)
- Anúncio do Absoluto Zero (142 min)
- Estratégias de Social Seller (91 min)
- Social Selling com Automação de ManyChat (134 min)

### CONVERSÃO:
- Etapas para uma Abordagem de Sucesso (107 min)
- A Arte de Quebrar Objeções (134 min)
- Follow-up que gera resultados (133 min)
- Metodologia Comercial para HOF (142 min)
- Inteligência Comercial na HOF (133 min)
- Roteiro para Consulta de Avaliação (125 min)
- Ancoragem que Converte na HOF (106 min)

## FORMATO DE RESPOSTA (responda SEMPRE neste JSON exato)

{
  "mapa_prescrito": "MAPA 30K — CONSISTÊNCIA",
  "pilar_gargalo": "DEMANDA",
  "justificativa": "Texto em 3-4 frases explicando o raciocínio diagnóstico.",
  "aulas_prioritarias": [
    "Nome da aula 1 (duração)",
    "Nome da aula 2 (duração)",
    "Nome da aula 3 (duração)"
  ],
  "alertas": [
    "Alerta 1 se houver",
    "Alerta 2 se houver"
  ],
  "protocolo_comercial_pendente": true,
  "validacao_necessaria": true
}

IMPORTANTE:
- "validacao_necessaria" é SEMPRE true.
- "protocolo_comercial_pendente" é true se o aluno indicou não dominar processo comercial.
- "aulas_prioritarias" deve ter entre 3 e 5 aulas, ordenadas por prioridade.
- Seja objetivo e direto. Sem rodeios.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { respostas } = await req.json();
    if (!respostas) {
      return new Response(JSON.stringify({ error: "Respostas são obrigatórias" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile name
    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("user_id", userId)
      .single();

    const nome = profile?.name || "Aluno";

    // Build user prompt
    const userPrompt = `Analise o diagnóstico deste aluno e prescreva o mapa adequado:

Nome: ${nome}
Faturamento médio últimos 3 meses: R$ ${respostas.faturamento}
Ticket médio atual: R$ ${respostas.ticket_medio}
Atendimentos por mês: ${respostas.atendimentos}
Estrutura de trabalho: ${respostas.estrutura}
Posicionamento: ${respostas.posicionamento}
Origem dos pacientes: ${respostas.origem_pacientes}
Principal dificuldade: ${respostas.dificuldade}
Domínio comercial: ${respostas.comercial}
Objetivo 6 meses: R$ ${respostas.objetivo}`;

    // Call Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
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
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Erro ao processar diagnóstico com IA");
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON from AI response
    let resultadoIA;
    try {
      // Extract JSON from response (may be wrapped in markdown code block)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        resultadoIA = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("JSON não encontrado na resposta");
      }
    } catch (parseErr) {
      console.error("Error parsing AI response:", parseErr, aiContent);
      resultadoIA = {
        mapa_prescrito: "Erro no processamento",
        pilar_gargalo: "N/A",
        justificativa: aiContent,
        aulas_prioritarias: [],
        alertas: ["Erro ao processar diagnóstico automaticamente. Revisão manual necessária."],
        protocolo_comercial_pendente: true,
        validacao_necessaria: true,
      };
    }

    // Save to database using service role for insert
    const supabaseServiceRole = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: diagnostico, error: insertError } = await supabaseServiceRole
      .from("diagnosticos")
      .insert({
        user_id: userId,
        respostas,
        resultado_ia: resultadoIA,
        status: "pendente",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving diagnostic:", insertError);
      throw new Error("Erro ao salvar diagnóstico");
    }

    return new Response(
      JSON.stringify({
        success: true,
        diagnostico_id: diagnostico.id,
        message: "Diagnóstico enviado! Aguarde a prescrição do seu mentor.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("processar-diagnostico error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
