// src/services/betsService.js
import { supabase } from "../supabaseClient";

/**
 * Registra uma aposta no banco de dados.
 * @param {Object} aposta - Dados da aposta
 * @param {string} aposta.user_id - ID do usuário que está apostando
 * @param {Array<number>} aposta.numeros - Números escolhidos
 * @param {number} aposta.quantity_numbers - Quantidade de números selecionados
 * @param {number} aposta.qty_tickets - Quantidade de bilhetes
 * @param {number} aposta.unit_price - Preço unitário da aposta
 * @param {number} aposta.total_price - Preço total da aposta
 * @param {string} aposta.status - Status inicial da aposta ('pending')
 * @param {string} aposta.pix_txid - TXID do pagamento
 * @param {string} aposta.referral_code - Código de indicação (opcional)
 */
export async function registrarAposta(aposta) {
  const month_year = new Date().toISOString().slice(0, 7); // YYYY-MM

  try {
    // 1️⃣ Insere a aposta
    const { data: bet, error: betError } = await supabase
      .from("bets")
      .insert([{
        ...aposta,
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
          referred_user_id: aposta.user_id
        });
      }
    }

    return bet;

  } catch (err) {
    console.error("Erro ao registrar aposta:", err);
    throw err;
  }
}

/**
 * Contabiliza apostas pagas e calcula prêmio do mês
 * @param {string} monthYear - Formato 'YYYY-MM'
 */
export async function calcularPremioMes(monthYear) {
  try {
    // Soma total de apostas pagas
    const { data, error } = await supabase
      .from("bets")
      .select("total_price")
      .eq("status", "paid")
      .eq("month_year", monthYear);

    if (error) throw new Error(error.message);

    const totalPremio = data.reduce((acc, cur) => acc + Number(cur.total_price), 0);

    return totalPremio;

  } catch (err) {
    console.error("Erro ao calcular prêmio do mês:", err);
    throw err;
  }
}
