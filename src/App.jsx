import { useEffect, useMemo, useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import IndicacoesView from "./IndicacoesView";
import PaymentForm from "./components/PaymentForm"; // 👈 Novo import
import React from "react";

// ================================
// UTIL & MOCK DATA (mantido do seu código)
// ================================
const nomesBR = [/* ...mantém sua lista... */];
const rostos = Array.from({ length: 30 }, (_, i) => `https://i.pravatar.cc/300?img=${i + 1}`);
const depoimentosSeed = [/* ...mantém seus depoimentos... */];

const precosPorQuantidade = { 7: 39.9, 8: 56.0, 9: 63.0, 10: 70.0 };
const LS_TOTAL_APOSTAS = "sf_total_apostas";
const LS_TOTAL_ARRECADADO = "sf_total_arrecadado";
const LS_PREMIO_ESCOLHIDO = "sf_premio_percentual";
const LS_REFERENCIA_USUARIO = "sf_user_ref";

// ================================
// COMPONENTES
// ================================
function HomeView() {
  // 👇 mantém exatamente a lógica que você já tinha
  const [qtdNumeros, setQtdNumeros] = useState(7);
  const [selecionados, setSelecionados] = useState([]);
  const [qtdApostas, setQtdApostas] = useState(1);
  const [totalApostas, setTotalApostas] = useState(() => Number(localStorage.getItem(LS_TOTAL_APOSTAS) || 0));
  const [totalArrecadado, setTotalArrecadado] = useState(() => Number(localStorage.getItem(LS_TOTAL_ARRECADADO) || 0));
  const [premioPercentual, setPremioPercentual] = useState(() => Number(localStorage.getItem(LS_PREMIO_ESCOLHIDO) || 30));
  const [mensagem, setMensagem] = useState("");
  const [mensagemFoto, setMensagemFoto] = useState(rostos[0]);
  const [pixPayload, setPixPayload] = useState("");
  const [pixTxid, setPixTxid] = useState("");

  // ...restante da lógica (sem alterações)...

  return (
    <main>
      {/* Hero, mensagens, totais, aposta, QRCode PIX, depoimentos */}
      {/* ...mantém exatamente o que você já tinha... */}
    </main>
  );
}

// ================================
// WRAPPER para Indicações
// ================================
function IndicacoesViewWrapper() {
  const [refAtual, setRefAtual] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(LS_REFERENCIA_USUARIO);
    if (saved) setRefAtual(JSON.parse(saved));
  }, []);

  if (!refAtual) return <p>Carregando...</p>;

  return <IndicacoesView refAtual={refAtual} />;
}

// ================================
// EXPORTAÇÃO COM ROUTER
// ================================
export default function App() {
  return (
    <Router>
      <header className="header">
        <h1>Sorteio</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/indicacoes">Indicações</Link>
          <Link to="/pagamento">Pagamento</Link> {/* 👈 Novo link */}
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/indicacoes" element={<IndicacoesViewWrapper />} />
        <Route path="/pagamento" element={<PaymentForm />} /> {/* 👈 Nova rota */}
      </Routes>
    </Router>
  );
}
