import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ResendAccessRequest {
  userId: string;
  email: string;
  name: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify requesting user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only administrators can resend access" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { userId, email, name } = body as ResendAccessRequest;

    console.log("Received body:", JSON.stringify({ userId, email, name }));

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      return new Response(
        JSON.stringify({ error: `Invalid userId format: ${userId}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "email and name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate temporary password
    const tempPassword = `Hof${Math.random().toString(36).slice(2, 8)}@${Math.floor(Math.random() * 90 + 10)}`;

    // Update password via admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: tempPassword }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email with credentials
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      // Password was updated but email failed
      return new Response(
        JSON.stringify({ success: true, warning: "Password updated but email not sent (RESEND_API_KEY not configured)", tempPassword }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const loginUrl = "https://apptimedom.lovable.app";
    const logoUrl = "http://timedom.com.br/wp-content/uploads/2026/02/LOGO_TIME_DOM.png";

    const { error: emailError } = await resend.emails.send({
      from: "Time Dom <noreply@timedom.com.br>",
      to: email,
      subject: "🔑 Suas Credenciais de Acesso - HOF Circle",
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
        🔑 Suas Credenciais de Acesso
      </h1>
    </div>

    <!-- Body -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; margin-bottom: 16px;">Olá, <strong>${name}</strong>!</p>
      <p style="font-size: 16px; margin-bottom: 24px;">
        Suas credenciais de acesso ao <strong>HOF Circle</strong> foram reenviadas conforme solicitado.
      </p>

      <!-- Credentials Box -->
      <div style="background-color: #F9FAFB; border: 2px solid #10B981; border-radius: 8px; padding: 24px; margin: 24px 0;">
        <p style="color: #6B7280; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">📧 Email de acesso:</p>
        <p style="color: #000000; font-size: 18px; font-weight: 700; font-family: Monaco, Courier, monospace; background-color: #FFFFFF; padding: 12px 16px; border-radius: 6px; border: 1px solid #E5E7EB; margin: 4px 0 16px 0;">
          ${email}
        </p>
        
        <p style="color: #6B7280; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">🔒 Senha temporária:</p>
        <p style="color: #000000; font-size: 18px; font-weight: 700; font-family: Monaco, Courier, monospace; background-color: #FFFFFF; padding: 12px 16px; border-radius: 6px; border: 1px solid #E5E7EB; margin: 4px 0 0 0;">
          ${tempPassword}
        </p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${loginUrl}" 
           style="background-color: #000000; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
          Acessar Plataforma
        </a>
      </div>

      <!-- Alert Box -->
      <div style="background-color: #F9FAFB; border: 1px solid #F59E0B; border-left: 4px solid #F59E0B; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <p style="color: #92400E; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">⚠️ Importante:</p>
        <p style="color: #92400E; font-size: 14px; margin: 4px 0;">• Esta é uma senha temporária</p>
        <p style="color: #92400E; font-size: 14px; margin: 4px 0;">• Recomendamos trocar sua senha após o primeiro login</p>
        <p style="color: #92400E; font-size: 14px; margin: 4px 0;">• Vá em Meu Perfil → Dados → Alterar Senha</p>
      </div>

      <p style="font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-bottom: 0;">
        Precisa de ajuda? Entre em contato com nosso suporte.<br>
        <strong>#timeDom</strong>
      </p>
    </div>
  </div>

  <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
    Este é um email automático, não responda a esta mensagem.<br>
    © ${new Date().getFullYear()} Time Dom - HOF Circle. Todos os direitos reservados.
  </p>
</body>
</html>`,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return new Response(
        JSON.stringify({ success: true, warning: "Password updated but email failed to send" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log activity
    try {
      await supabaseAdmin.from("admin_audit_logs").insert({
        admin_user_id: requestingUser.id,
        action: "access_resent",
        target_user_id: userId,
        details: { email, method: "resend_access" },
      });
    } catch (e) {
      console.error("Failed to log audit:", e);
    }

    console.log("Access resent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true, message: "Credentials resent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
