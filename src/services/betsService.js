// src/services/betsService.js
import { supabase } from "../supabaseClient";

export async function registrarAposta(aposta) {
  const month_year = new Date().toISOString().slice(0, 7); // YYYY-MM

  try {
    let userId = aposta.user_id;

    // 🔹 Se não foi passado user_id, busca ou cria um usuário de teste
    if (!userId) {
      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", "teste@teste.com")
        .single();

      if (userError || !existingUser) {
        const { data: newUser, error: createUserError } = await supabase
          .from("users")
          .insert([{ email: "teste@teste.com", full_name: "Usuário Teste" }])
          .select()
          .single();

        if (createUserError) throw new Error(createUserError.message);
        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }
    }

    // 🔹 Garante que numeros não seja null
    const numerosValidos = aposta.numeros ?? []; 

    // 1️⃣ Insere a aposta
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .insert([{
        ...aposta,
        user_id: userId,      // força user_id válido
        numeros: numerosValidos,
        month_year
      }])
      .select()
      .single();

    if (betError) throw new Error(betError.message);

    // 2️⃣ Atualiza agregados mensais
    await supabase.rpc("increment_aggregate", {
      month: month_year,
      tickets: aposta.qty_tickets || 1,
      amount: aposta.total_price || aposta.unit_price * aposta.qty_tickets
    });

    // 3️⃣ Se houver código de indicação, registra a relação
    if (aposta.referral_code) {
      const { data: referrer, error: refError } = await supabase
        .from("users")
        .select("id")
        .eq("referral_code", aposta.referral_code)
        .single();

      if (!refError && referrer) {
        await supabase.from("referrals").insert({
          referrer_user_id: referrer.id,
          referred_user_id: userId
        });
      }
    }

    return bet;

  } catch (err) {
    console.error("Erro ao registrar aposta:", err);
    throw err;
  }
}
