// src/IndicacoesView.jsx
import { useEffect, useState } from "react";
import { contarIndicacoesValidas, generateReferralCode } from "./services/referralService";

export default function IndicacoesView({ userId }) {
  const [codigo, setCodigo] = useState("");
  const [totalIndicacoes, setTotalIndicacoes] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Gera ou busca código de indicação do usuário
  useEffect(() => {
    async function fetchCodigo() {
      if (!userId) return;
      try {
        const code = await generateReferralCode(userId);
        setCodigo(code);
      } catch (err) {
        console.error("Erro ao buscar código de indicação:", err);
      }
    }
    fetchCodigo();
  }, [userId]);

  // 2️⃣ Conta indicações válidas (pagas)
  useEffect(() => {
    async function fetchIndicacoes() {
      if (!userId) return;
      try {
        setLoading(true);
        const total = await contarIndicacoesValidas(userId);
        setTotalIndicacoes(total);
      } catch (err) {
        console.error("Erro ao contar indicações:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchIndicacoes();
  }, [userId]);

  if (!userId) {
    return <p>Carregando usuário...</p>;
  }

  const linkCompartilhar = `https://mega7dasorte.github.io/#/indicacoes?ref=${codigo}`;

  return (
    <main className="indicacoes-view">
      <h2>Convide seus amigos</h2>
      <p>Quanto mais pessoas você indicar, mais chances terá de ganhar no final do mês.</p>

      <div>
        <span><strong>Código:</strong> {codigo}</span>
        <button onClick={() => navigator.clipboard.writeText(codigo)}>Copiar código</button>
      </div>

      <div>
        <span><strong>Link de indicação:</strong> {linkCompartilhar}</span>
        <button onClick={() => navigator.clipboard.writeText(linkCompartilhar)}>Copiar link</button>
      </div>

      <h3>Suas indicações válidas</h3>
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <p>Você já possui <strong>{totalIndicacoes}</strong> indicações confirmadas 🎉</p>
      )}
    </main>
  );
}
