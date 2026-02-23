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
}

const logoUrl = "http://timedom.com.br/wp-content/uploads/2026/02/LOGO_TIME_DOM.png";

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
    const { email, nome }: EmailRequest = await req.json();

    if (!email || !nome) {
      return new Response(
        JSON.stringify({ error: "Email e nome são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Time Dom <noreply@timedom.com.br>",
      to: email,
      subject: "Redefinição de Senha - HOF Circle",
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
  <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background-color: #000000; padding: 30px; text-align: center;">
      <img src="${logoUrl}" alt="TIME DOM" style="max-width: 180px; height: auto; display: block; margin: 0 auto 15px auto;" />
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
        🔐 Redefinição de Senha
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px;">
      <h2 style="color: #1f2937; margin-top: 0;">Olá ${nome}!</h2>
      
      <p style="font-size: 16px;">Sua senha no <strong>HOF Circle</strong> foi redefinida por um administrador.</p>
      
      <div style="background-color: #F9FAFB; border: 1px solid #EF4444; border-left: 4px solid #EF4444; border-radius: 8px; padding: 16px; margin: 20px 0; color: #1f2937;">
        <p style="margin: 0; font-weight: bold; color: #991b1b;">
          ⚠️ Ação necessária: Entre em contato com o administrador para obter sua nova senha temporária.
        </p>
      </div>
      
      <p style="font-size: 16px;">Após fazer login com a nova senha, recomendamos que você a altere imediatamente para uma senha de sua preferência.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://apptimedom.lovable.app/login"
           style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
          Acessar Plataforma
        </a>
      </div>

      <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-bottom: 0;">
        Se você não solicitou esta redefinição, entre em contato conosco imediatamente.<br>
        <strong>#timeDom</strong>
      </p>
    </div>
  </div>

  <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
    Este é um email automático, não responda a esta mensagem.<br>
    © ${new Date().getFullYear()} Time Dom. Todos os direitos reservados.
  </p>
</body>
</html>`,
    });

    if (error) {
      console.error("Error sending email:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Password reset email sent successfully:", data);

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
