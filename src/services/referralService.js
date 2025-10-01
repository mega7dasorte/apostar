// src/services/referralService.js
import { supabase } from "../supabaseClient";

/**
 * Registra uma indicação no momento em que o usuário entra com ?ref=CODE
 * - referrer_id = quem indicou (dono do referral_code)
 * - referred_id = quem entrou com o código
 */
export async function registrarIndicacao(referrer_id, referred_id) {
  const { data, error } = await supabase
    .from("referrals")
    .insert([{ referrer_user_id: referrer_id, referred_user_id: referred_id }]);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Conta somente indicações que já foram confirmadas por pagamento
 * - referrerId = ID do usuário que indicou
 */
export async function contarIndicacoesValidas(referrerId) {
  // 1. Busca todos os indicados que esse usuário trouxe
  const { data: referrals, error } = await supabase
    .from("referrals")
    .select("referred_user_id")
    .eq("referrer_user_id", referrerId);

  if (error) throw new Error(error.message);
  if (!referrals || referrals.length === 0) return 0;

  let validCount = 0;

  // 2. Para cada indicado, verifica se já fez um pagamento com status "pago"
  for (let referral of referrals) {
    const { data: pagamentos, error: payError } = await supabase
      .from("payments")
      .select("id")
      .eq("user_id", referral.referred_user_id)
      .eq("status", "pago");

    if (payError) throw new Error(payError.message);

    if (pagamentos && pagamentos.length > 0) {
      validCount++;
    }
  }

  return validCount;
}

/**
 * Gera e atribui um código de indicação ao usuário
 */
export async function generateReferralCode(user_id) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Ex: ABC123

  const { data, error } = await supabase
    .from("users")
    .update({ referral_code: code })
    .eq("id", user_id)
    .select()
    .single();

  if (error) throw error;
  return data.referral_code;
}

function calcularIndicacoesValidas(userId) {
  return referrals.filter(r => r.referrer_user_id === userId && r.is_valid).length;
}
