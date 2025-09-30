// src/services/dashboardService.js
import { supabase } from '../supabaseClient';

export async function getMonthlyStats(month_year) {
  const { data, error } = await supabase
    .from('aggregates')
    .select('*')
    .eq('month_year', month_year)
    .single();
  if (error) throw new Error(error.message);

  const premio = Number(data.total_amount) * 0.5; // 50% do total
  return { ...data, premio };
}
