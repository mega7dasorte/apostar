// src/services/referralService.js
import { supabase } from '../supabaseClient';

export async function registrarIndicacao(referrer_id, referred_id) {
  const { data, error } = await supabase
    .from('referrals')
    .insert([{ referrer_user_id: referrer_id, referred_user_id: referred_id }]);
  if (error) throw new Error(error.message);
  return data;
}

export async function contarIndicacoes(user_id) {
  const { data, error } = await supabase
    .from('referrals')
    .select('id', { count: 'exact' })
    .eq('referrer_user_id', user_id);
  if (error) throw new Error(error.message);
  return data.length;
}

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
