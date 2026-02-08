import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  email: string;
  nome: string;
  senhaTemporaria?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const resend = new Resend(resendApiKey);
    const { email, nome, senhaTemporaria }: EmailRequest = await req.json();

    if (!email || !nome) {
      return new Response(
        JSON.stringify({ error: "Email e nome são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const passwordSection = senhaTemporaria
      ? `
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #92400e;">🔐 Senha temporária: ${senhaTemporaria}</p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #78350f;">Por segurança, redefina sua senha no primeiro acesso.</p>
        </div>
      `
      : "";

    const { data, error } = await resend.emails.send({
      from: "HOF Circle <onboarding@resend.dev>",
      to: email,
      subject: "Bem-vindo ao HOF Circle! 🚀",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Bem-vindo ao HOF Circle!</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1f2937; margin-top: 0;">Olá ${nome}!</h2>
            
            <p style="font-size: 16px;">Seu acesso ao <strong>HOF Circle</strong> foi liberado com sucesso! 🎊</p>
            
            ${passwordSection}
            
            <p style="font-size: 16px;">Acesse a plataforma e comece sua jornada de transformação na harmonização facial.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://apptimedom.lovable.app" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                Acessar Plataforma
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-bottom: 0;">
              Qualquer dúvida, estamos à disposição!<br>
              <strong>Equipe HOF Circle</strong>
            </p>
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
              Este é um email automático, não responda a esta mensagem.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Welcome email sent successfully:", data);

    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
