import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CreateTeamMemberRequest {
  email: string;
  password: string;
  name: string;
  ownerId: string; // The doctor's user_id
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify calling user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check calling user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, password, name, ownerId }: CreateTeamMemberRequest = await req.json();

    if (!email || !password || !name || !ownerId) {
      return new Response(
        JSON.stringify({ error: "Email, password, name and ownerId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check team member limit (max 5 active per owner)
    const { data: existingMembers, error: countError } = await supabaseAdmin
      .from("team_members")
      .select("id")
      .eq("owner_id", ownerId)
      .eq("status", "active");

    if (countError) throw countError;

    if (existingMembers && existingMembers.length >= 5) {
      return new Response(
        JSON.stringify({ error: "Este médico já atingiu o limite de 5 membros de equipe ativos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify owner exists and is a regular user (not team_member)
    const { data: ownerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", ownerId)
      .single();

    if (!ownerRole || ownerRole.role === "team_member") {
      return new Response(
        JSON.stringify({ error: "Owner inválido. Deve ser um médico (usuário regular)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create user in Supabase Auth
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) {
      console.error("Error creating team member user:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUserId = userData.user.id;

    // 2. Update role to team_member (trigger creates default 'user' role)
    const { error: updateRoleError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: "team_member" })
      .eq("user_id", newUserId);

    if (updateRoleError) {
      console.error("Error updating role:", updateRoleError);
      // Try upsert
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: newUserId, role: "team_member" }, { onConflict: "user_id" });
    }

    // 3. Create team_members record
    const { error: teamError } = await supabaseAdmin
      .from("team_members")
      .insert({
        member_id: newUserId,
        owner_id: ownerId,
        status: "active",
        created_by: callingUser.id,
      });

    if (teamError) {
      console.error("Error creating team member record:", teamError);
      // Cleanup: delete the created user since linking failed
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return new Response(
        JSON.stringify({ error: "Erro ao vincular membro à equipe: " + teamError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Team member created: ${email}`,
        userId: newUserId,
      }),
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
