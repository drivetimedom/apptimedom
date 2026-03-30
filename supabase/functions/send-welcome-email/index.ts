import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, name, email, password } = await req.json();

    if (!to || !name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, name, email, password" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "TIME DOM <noreply@timedom.com.br>",
        to: [to],
        subject: "Bem-vindo ao HOF Circle! Suas Credenciais de Acesso 🎉",
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:24px;">HOF Circle</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#000000;margin:0 0 20px;font-size:22px;">Bem-vindo ao HOF Circle! 🎉</h2>
              <p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 20px;">
                Olá <strong>${name}</strong>,
              </p>
              <p style="color:#333333;font-size:16px;line-height:1.6;margin:0 0 30px;">
                Seu acesso à plataforma HOF Circle foi liberado! Abaixo estão suas credenciais:
              </p>
              
              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8;border:1px solid #e0e0e0;border-radius:8px;margin:0 0 30px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="color:#666666;font-size:14px;margin:0 0 8px;">🔑 <strong>Suas Credenciais:</strong></p>
                    <p style="color:#333333;font-size:15px;margin:0 0 6px;"><strong>Email:</strong> ${email}</p>
                    <p style="color:#333333;font-size:15px;margin:0;"><strong>Senha:</strong> ${password}</p>
                  </td>
                </tr>
              </table>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:0 0 30px;">
                    <a href="https://apptimedom.lovable.app/login" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:6px;font-size:16px;font-weight:bold;">
                      Acessar Plataforma →
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- What you have access to -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin:0 0 30px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="color:#166534;font-size:14px;margin:0 0 10px;"><strong>📚 O que você tem acesso:</strong></p>
                    <p style="color:#166534;font-size:14px;margin:0 0 4px;">✅ Todos os cursos da mentoria</p>
                    <p style="color:#166534;font-size:14px;margin:0 0 4px;">✅ Swipe File completo (+100 materiais)</p>
                    <p style="color:#166534;font-size:14px;margin:0 0 4px;">✅ Calculadoras de gestão</p>
                    <p style="color:#166534;font-size:14px;margin:0 0 4px;">✅ Acompanhamento individual</p>
                    <p style="color:#166534;font-size:14px;margin:0;">✅ Comunidade HOF Network</p>
                  </td>
                </tr>
              </table>
              
              <p style="color:#999999;font-size:13px;line-height:1.5;margin:0 0 10px;">
                💡 <strong>Dica:</strong> Altere sua senha no primeiro acesso em Perfil → Configurações.
              </p>
              <p style="color:#999999;font-size:13px;line-height:1.5;margin:0;">
                Dúvidas? Fale conosco no WhatsApp: (44) 99879-2925
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f5f5f5;padding:20px 30px;text-align:center;">
              <p style="color:#999999;font-size:12px;margin:0;">#timeDom</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `,
      }),
    });

    const data = await res.json();
    const responseBody = await res.text();

    return new Response(
      JSON.stringify(data),
      {
        status: res.ok ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error sending welcome email:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
