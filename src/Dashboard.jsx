// src/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./supabaseClient";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [aggregates, setAggregates] = useState({ total_tickets: 0, total_amount: 0 });
  const [recentBets, setRecentBets] = useState([]);
  const [error, setError] = useState(null);

  const month_year = new Date().toISOString().slice(0,7); // YYYY-MM

  useEffect(() => {
    async function fetchDashboard() {
      try {
        // 1️⃣ Busca agregados do mês atual
        const { data: aggData, error: aggError } = await supabase
          .from("aggregates")
          .select("*")
          .eq("month_year", month_year)
          .single();

        if (aggError && aggError.code !== "PGRST116") throw new Error(aggError.message);

        setAggregates(aggData || { total_tickets: 0, total_amount: 0 });

        // 2️⃣ Busca últimas apostas pagas
        const { data: betsData, error: betsError } = await supabase
          .from("bets")
          .select("*")
          .eq("month_year", month_year)
          .eq("status", "paid")
          .order("created_at", { ascending: false })
          .limit(10);

        if (betsError) throw new Error(betsError.message);

        setRecentBets(betsData);

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [month_year]);

  if (loading) return <p>Carregando dashboard...</p>;
  if (error) return <p style={{ color: "crimson" }}>Erro: {error}</p>;

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: "1rem" }}>
      <h2>Dashboard - {month_year}</h2>
      
      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        <div style={{ flex: 1, padding: "1rem", background: "#ffffff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3>Total de Apostas Pagas</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{aggregates.total_tickets}</p>
        </div>
        <div style={{ flex: 1, padding: "1rem", background: "#ffffff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <h3>Prêmio Acumulado (R$)</h3>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{aggregates.total_amount?.toFixed(2)}</p>
        </div>
      </div>

      <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: "1rem" }}>
        <h3>Últimas Apostas Pagas</h3>
        {recentBets.length === 0 ? (
          <p>Nenhuma aposta registrada ainda.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Usuário</th>
                <th style={{ textAlign: "left", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Números</th>
                <th style={{ textAlign: "right", padding: "0.5rem", borderBottom: "1px solid #ccc" }}>Valor (R$)</th>
              </tr>
            </thead>
            <tbody>
              {recentBets.map(bet => (
                <tr key={bet.id}>
                  <td style={{ padding: "0.5rem" }}>{bet.user_id}</td>
                  <td style={{ padding: "0.5rem" }}>{bet.numeros.join(", ")}</td>
                  <td style={{ padding: "0.5rem", textAlign: "right" }}>{bet.total_price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
