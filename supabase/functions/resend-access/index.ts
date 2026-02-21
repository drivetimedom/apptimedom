import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const { userId, email, name }: ResendAccessRequest = await req.json();

    if (!userId || !email || !name) {
      return new Response(
        JSON.stringify({ error: "userId, email and name are required" }),
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

    const { error: emailError } = await resend.emails.send({
      from: "Time Dom <noreply@timedom.com.br>",
      to: email,
      subject: "🔑 Suas Credenciais de Acesso - HOF Circle",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff;">
          
          <!-- Logo Section -->
          <div style="text-align: center; margin-bottom: 32px; padding: 24px; background-color: #000000; border-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 2px;">TIME DOM</h2>
          </div>

          <!-- Title -->
          <h1 style="color: #000000; font-size: 28px; font-weight: 700; line-height: 1.3; margin-bottom: 24px; text-align: center;">
            🔑 Suas Credenciais de Acesso
          </h1>

          <!-- Greeting -->
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
               style="background-color: #000000; border-radius: 6px; color: #FFFFFF; font-size: 16px; font-weight: 600; text-decoration: none; text-align: center; display: inline-block; padding: 14px 32px;">
              Acessar Plataforma
            </a>
          </div>

          <!-- Alert Box -->
          <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #92400E; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">⚠️ Importante:</p>
            <p style="color: #92400E; font-size: 14px; margin: 4px 0;">• Esta é uma senha temporária</p>
            <p style="color: #92400E; font-size: 14px; margin: 4px 0;">• Recomendamos trocar sua senha após o primeiro login</p>
            <p style="color: #92400E; font-size: 14px; margin: 4px 0;">• Vá em Meu Perfil → Dados → Alterar Senha</p>
          </div>

          <!-- Footer -->
          <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-top: 32px; text-align: center;">
            Precisa de ajuda? Entre em contato com nosso suporte.
          </p>
          <p style="color: #9CA3AF; font-size: 12px; line-height: 1.6; margin-top: 16px; text-align: center;">
            © ${new Date().getFullYear()} TIME DOM - HOF Circle. Todos os direitos reservados.
          </p>
        </body>
        </html>
      `,
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
