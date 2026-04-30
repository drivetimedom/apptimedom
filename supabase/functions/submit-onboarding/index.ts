import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, submission } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Código do link é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!submission) {
      return new Response(JSON.stringify({ error: "Dados do formulário são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: linkData, error: linkError } = await supabaseAdmin
      .from("onboarding_links")
      .select("id, code, expires_at, is_active, submission_id")
      .eq("code", code)
      .eq("is_active", true)
      .is("submission_id", null)
      .maybeSingle();

    if (linkError) {
      throw linkError;
    }

    if (!linkData) {
      return new Response(JSON.stringify({ error: "Link inválido ou já utilizado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (linkData.expires_at && new Date(linkData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Este link expirou" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: createdSubmission, error: insertError } = await supabaseAdmin
      .from("onboarding_submissions")
      .insert(submission)
      .select("id")
      .single();

    if (insertError) {
      throw insertError;
    }

    const { error: updateError } = await supabaseAdmin
      .from("onboarding_links")
      .update({ submission_id: createdSubmission.id, is_active: false })
      .eq("id", linkData.id);

    if (updateError) {
      throw updateError;
    }

    try {
      const nomeAluno = submission?.nome_completo || submission?.nome || submission?.full_name;
      const emailAluno = submission?.email;
      const whatsappAluno = submission?.whatsapp || submission?.telefone || submission?.phone;

      if (emailAluno) {
        const gestaoResponse = await fetch(
          'https://jwtsusupavtkrlelpcqv.supabase.co/functions/v1/receive-onboarding',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-webhook-secret': 'timedom2026secure',
            },
            body: JSON.stringify({
              nome: nomeAluno,
              email: emailAluno,
              whatsapp: whatsappAluno,
            }),
          }
        );

        if (!gestaoResponse.ok) {
          console.error('Erro ao sincronizar com sistema de gestão:', await gestaoResponse.text());
        } else {
          console.log('Sincronizado com sistema de gestão com sucesso');
        }
      }
    } catch (syncError) {
      console.error('Erro na sincronização com gestão (não crítico):', syncError);
    }

    return new Response(JSON.stringify({ success: true, submissionId: createdSubmission.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("submit-onboarding error:", error);
    const message = error instanceof Error ? error.message : "Erro inesperado ao enviar cadastro";

    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});