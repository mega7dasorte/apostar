import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.info("Confirm Payment Function Started");

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

async function sendEmail(email, nome, numeros, total) {
  if (!SENDGRID_API_KEY) throw new Error("SendGrid API key não configurada.");
  const body = {
    personalizations: [{ to: [{ email }] }],
    from: { email: "mega7dasorte@gmail.com", name: "Mega7 da Sorte" },
    subject: "Confirmação de Aposta",
    content: [
      {
        type: "text/plain",
        value: `Olá ${nome}, sua aposta foi registrada com sucesso!
Números: ${numeros.join(", ")}
Valor: R$${total.toFixed(2)}`
      }
    ]
  };
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Erro ao enviar e-mail:", text);
    throw new Error(`SendGrid erro: ${res.status}`);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-client-info, Apikey, Prefer"
      }
    });
  }

  try {
    const { txid, email, nome, numeros, quantity_numbers, unit_price } = await req.json();

    if (!txid || !email || !nome || !numeros || !quantity_numbers || !unit_price) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos." }), { status: 400 });
    }

    const total_price = unit_price * quantity_numbers;
    const month_year = new Date().toISOString().slice(0, 7);

    const { createClient } = await import("@supabase/supabase-js");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_KEY");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Atualiza pagamento como "paid"
    const { data: payment, error: payError } = await supabase
      .from("payments")
      .update({ status: "paid" })
      .eq("txid", txid)
      .select()
      .single();

    if (payError || !payment) throw new Error(payError?.message || "Pagamento não encontrado");

    // ====== GARANTE USUÁRIO ======
    let userId: string;

    const { data: existingUser, error: userSelectError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userSelectError) throw new Error(userSelectError.message);

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // cria novo usuário anônimo
      const { data: newUser, error: insertUserError } = await supabase
        .from("users")
        .insert({ email, full_name: nome })
        .select("id")
        .single();

      if (insertUserError) throw new Error(insertUserError.message);

      userId = newUser.id;
    }

    // Usa os números do payment se não vierem no body
    const numerosAposta = numeros || payment.numeros;

    // Cria aposta
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .insert([
        {
          user_id: userId,
          numeros: numerosAposta,
          quantity_numbers,
          qty_tickets: 1,
          unit_price,
          total_price,
          status: "paid",
          pix_txid: txid,
          month_year
        }
      ])
      .select()
      .single();

    if (betError) throw new Error(betError.message);

    // Atualiza agregados mensais
    const { error: aggError } = await supabase.rpc("increment_aggregate", {
      month: month_year,
      tickets: 1,
      amount: total_price
    });
    if (aggError) throw new Error(aggError.message);

    // Envia e-mail
    await sendEmail(email, nome, numerosAposta, total_price);

    return new Response(JSON.stringify({ success: true, bet }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (err) {
    console.error("Erro no confirm-payment:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});
