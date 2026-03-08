import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify caller is a proprietaire
    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .maybeSingle();

    if (!callerRole || callerRole.role !== "proprietaire") {
      return new Response(JSON.stringify({ error: "Seul un propriétaire peut créer un gérant" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { full_name, whatsapp, email, password, shop_id } = await req.json();

    // Validate inputs
    if (!full_name || !email || !password || !shop_id) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify shop belongs to caller
    const { data: shop, error: shopError } = await supabaseAdmin
      .from("shops")
      .select("id, nom")
      .eq("id", shop_id)
      .eq("user_id", caller.id)
      .maybeSingle();

    if (shopError || !shop) {
      return new Response(JSON.stringify({ error: "Boutique introuvable" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the user account
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) {
      const msg = createError.message.includes("already been registered")
        ? "Cet email est déjà utilisé"
        : createError.message;
      return new Response(JSON.stringify({ error: msg }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const managerId = newUser.user.id;

    // Set role to gérant
    await supabaseAdmin
      .from("user_roles")
      .update({ role: "gérant" })
      .eq("user_id", managerId);

    // Set must_change_password on profile
    await supabaseAdmin
      .from("profiles")
      .update({ must_change_password: true })
      .eq("user_id", managerId);

    // Create shop_managers link
    await supabaseAdmin.from("shop_managers").insert({
      owner_id: caller.id,
      manager_id: managerId,
      shop_id: shop_id,
      manager_name: full_name,
      manager_whatsapp: whatsapp || "",
      manager_email: email,
    });

    return new Response(
      JSON.stringify({
        success: true,
        manager: {
          id: managerId,
          full_name,
          email,
          whatsapp,
          shop_name: shop.nom,
          shop_id,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
