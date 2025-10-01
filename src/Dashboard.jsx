// src/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 1️⃣ Puxa pagamentos
      const { data: payData, error: payError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (payError) console.error("Erro ao carregar pagamentos:", payError);
      else setPayments(payData || []);

      // 2️⃣ Puxa referrals
      const { data: refData, error: refError } = await supabase
        .from("referrals")
        .select("*");

      if (refError) console.error("Erro ao carregar referrals:", refError);
      else setReferrals(refData || []);

      // 3️⃣ Puxa usuários
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, nome, referral_code");

      if (userError) console.error("Erro ao carregar usuários:", userError);
      else setUsers(userData || []);

      setLoading(false);
    }

    fetchData();
  }, []);

  // 4️⃣ Calcula indicações válidas (só conta se o referido tiver pagamento "pago")
  function calcularIndicacoesValidas(userId) {
    const indicacoes = referrals.filter(r => r.referrer_user_id === userId);
    let validas = 0;

    indicacoes.forEach(indicacao => {
      const pagou = payments.find(
        p =>
          p.user_id === indicacao.referred_user_id &&
          p.status === "pago"
      );
      if (pagou) validas++;
    });

    return validas;
  }

  if (loading) return <p>Carregando dashboard...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>📊 Dashboard Administrativo</h2>

      {/* Seção de Pagamentos */}
      <h3>Pagamentos</h3>
      <table border="1" cellPadding="8" style={{ marginBottom: 30 }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.txid}>
              <td>{p.nome}</td>
              <td>{p.cpf}</td>
              <td>{p.email}</td>
              <td>R$ {Number(p.valor).toFixed(2)}</td>
              <td>{p.status}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Seção de Ranking de Indicações */}
      <h3>🏆 Ranking de Indicações Válidas</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Código de Indicação</th>
            <th>Indicações Válidas</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.referral_code || "—"}</td>
              <td>{calcularIndicacoesValidas(u.id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
