//src/app.jsx
import { useEffect, useMemo, useState,useRef } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import IndicacoesView from "./IndicacoesView";
import Dashboard from "./Dashboard";
import PaymentForm from "./components/PaymentForm";
import React from "react";

// ================================
// UTIL & MOCK DATA (mantido do seu código)
// ================================
const nomesBR = [
  "João da Silva, São Paulo",
  "Maria Oliveira, Rio de Janeiro",
  "Carlos Souza, Belo Horizonte",
  "Fernanda Lima, Recife",
  "André Santos, Curitiba",
  "Patrícia Almeida, Salvador",
  "Ricardo Gomes, Porto Alegre",
  "Luciana Rocha, Brasília",
  "Bruno Carvalho, Fortaleza",
  "Paula Fernandes, Manaus",
  "Rafaela Martins, Campinas",
  "Diego Alves, Goiânia",
  "Camila Teixeira, Natal",
  "Marcos Vinícius, Santos",
  "Bianca Castro, Florianópolis",
];

const rostos = Array.from({ length: 30 }, (_, i) => `https://i.pravatar.cc/300?img=${i + 1}`);

const depoimentosSeed = [
  { nome: "José, Curitiba", texto: "“Com esse prêmio, comprei minha casa própria. Foi surreal ver meu nome nas mensagens!”" },
  { nome: "Fernanda, Recife", texto: "“Minha vida mudou para sempre. Agora sou milionária!”" },
  { nome: "Maria, São Paulo", texto: "“Realizei meus sonhos com essa sorte. Uma experiência divertida!”" },
  { nome: "Igor, Belo Horizonte", texto: "“Eu não acreditava até ver meu código Pix aparecer.”" },
];

const precosPorQuantidade = {3:5.0, 7: 39.9, 8: 56.0, 9: 63.0, 10: 70.0 };
const opcoesPremio = [20, 30, 40];

const LS_TOTAL_APOSTAS = "sf_total_apostas";
const LS_TOTAL_ARRECADADO = "sf_total_arrecadado";
const LS_PREMIO_ESCOLHIDO = "sf_premio_percentual";
const LS_REFERENCIA_USUARIO = "sf_user_ref";
const LS_INDICACOES = "sf_indicacoes";

function getRandomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomUUID() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = (Math.random() * 16) | 0; const v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16); }); }
function formatBRL(value) {
  if (typeof value !== "number") return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


// ================================
// COMPONENTES
// ================================
function HomeView() {
  const [qtdNumeros, setQtdNumeros] = useState(7);
  const [selecionados, setSelecionados] = useState([]);
  const [qtdApostas, setQtdApostas] = useState(1);

  const [totalApostas, setTotalApostas] = useState(() => Number(localStorage.getItem(LS_TOTAL_APOSTAS) || 0));
  const [totalArrecadado, setTotalArrecadado] = useState(() => Number(localStorage.getItem(LS_TOTAL_ARRECADADO) || 0));
  const [premioPercentual, setPremioPercentual] = useState(() => Number(localStorage.getItem(LS_PREMIO_ESCOLHIDO) || 30));

  const [mensagem, setMensagem] = useState("");
  const [mensagemFoto, setMensagemFoto] = useState(getRandomItem(rostos));
  const [pixPayload, setPixPayload] = useState("");
  const [pixTxid, setPixTxid] = useState("");
  const [liberouIndicacoes, setLiberouIndicacoes] = useState(false);

  const [refAtual, setRefAtual] = useState(() => {
    const saved = localStorage.getItem(LS_REFERENCIA_USUARIO);
    if (saved) return JSON.parse(saved);
    const novo = { id: randomUUID(), codigo: `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}` };
    localStorage.setItem(LS_REFERENCIA_USUARIO, JSON.stringify(novo));
    return novo;
  });

  const [mostrarPaymentForm, setMostrarPaymentForm] = useState(false);
  const [paymentCreated, setPaymentCreated] = useState(null);
  const [mostrarIndicacoesInline, setMostrarIndicacoesInline] = useState(false);

  const depoimentos = useMemo(() => depoimentosSeed.map((d, i) => ({ ...d, foto: rostos[i % rostos.length] })), []);

  // ticker de mensagens
  useEffect(() => {
    const intervalo = setInterval(() => {
      setMensagem(`${getRandomItem(nomesBR)} acabou de ganhar R$ 500 mil. Mais um milionário(a)`);
      setMensagemFoto(getRandomItem(rostos));
    }, 3000);
    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => { localStorage.setItem(LS_TOTAL_APOSTAS, String(totalApostas)); }, [totalApostas]);
  useEffect(() => { localStorage.setItem(LS_TOTAL_ARRECADADO, String(totalArrecadado)); }, [totalArrecadado]);
  useEffect(() => { localStorage.setItem(LS_PREMIO_ESCOLHIDO, String(premioPercentual)); }, [premioPercentual]);

  const precoUnitario = precosPorQuantidade[qtdNumeros] || null;
  const totalCompra = precoUnitario ? precoUnitario * qtdApostas : 0;

  const toggleNumero = (n) => {
    if (selecionados.includes(n)) setSelecionados(selecionados.filter((x) => x !== n));
    else if (selecionados.length < qtdNumeros) setSelecionados([...selecionados, n]);
  };

  const podeConfirmar = selecionados.length === qtdNumeros && precoUnitario && qtdApostas >= 1 && qtdApostas <= 1000;
  

  const premioPrevisto = (totalArrecadado * premioPercentual) / 100;


  const [numerosConfirmados, setNumerosConfirmados] = useState([]);
  const formRef = useRef(null);

  const confirmarAposta = () => {
    if (!podeConfirmar) return;

    setTotalApostas((t) => t + qtdApostas);
    setTotalArrecadado((v) => v + totalCompra);
    if (qtdNumeros >= 9) setLiberouIndicacoes(true);

    const txid = randomUUID().slice(0, 25);
    const chave = "c8875076-656d-4a18-8094-c70c67dbb56c";
    const descricao = `APOSTA-${qtdNumeros}N-${qtdApostas}X`;
    const payload = `PIX-FICTICIO|BANK:pagBank|CHAVE:${chave}|TXID:${txid}|DESC:${descricao}|VLR:${totalCompra.toFixed(2)}`;
    setPixTxid(txid);
    setPixPayload(payload);

    // 🚀 Não limpamos mais os números antes de mostrar o form
    setNumerosConfirmados([...selecionados]);

    setMostrarPaymentForm(true);

    // scroll automático para o form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };


  return (
    <main className="container">
      {/* HERO */}
      <section className="hero">
        <h2 className="hero-title">Escolha seus números e participe</h2>
        <p className="hero-subtitle">Prêmios de até <strong>R$ 500.000,00</strong>. Com transações reais, na hora sem burocracia.</p>
        <p className="text-xs disclaimer">

        </p>
      </section>

      {/* MENSAGENS */}
      <section className="mensagem-container shadow">
        <p>{mensagem || "Aguardando vencedores..."}</p>
      </section>

      {/* TOTAIS */}
      <section className="totais-container">
        <div><strong>Total de apostas:</strong> {totalApostas}0000</div>
        <div><strong>Prêmio do mês:</strong> {formatBRL(premioPrevisto * 1000)}</div>
      </section>

      {/* APOSTAS */}
      <section className="aposta-container">
        <div className="aposta-opcoes">
          <label>Quantidade de números</label>
          <select value={qtdNumeros} onChange={(e) => { setQtdNumeros(Number(e.target.value)); setSelecionados([]); }}>
            <option value={3}>3 números — {formatBRL(precosPorQuantidade[3])}</option>
            <option value={7}>7 números — {formatBRL(precosPorQuantidade[7])}</option>
            <option value={8}>8 números — {formatBRL(precosPorQuantidade[8])}</option>
            <option value={9}>9 números — {formatBRL(precosPorQuantidade[9])}</option>
            <option value={10}>10 números — {formatBRL(precosPorQuantidade[10])}</option>
          </select>
        </div>

        <div className="aposta-opcoes">
          <label>Quantidade de apostas</label>
          <input type="number" min={1} max={1000} value={qtdApostas} onChange={(e) => setQtdApostas(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))} />
        </div>

        <div className="aposta-total">Total desta compra: {formatBRL(totalCompra)}</div>

        <div className="grid-numeros">
          {Array.from({ length: 70 }, (_, i) => i + 1).map((n) => (
            <button key={n} onClick={() => toggleNumero(n)} className={selecionados.includes(n) ? "numero-selecionado" : ""}>{n}</button>
          ))}
        </div>

        <p className="selecionados-info">
          Selecionados ({numerosConfirmados.length > 0 ? numerosConfirmados.length : selecionados.length}/{qtdNumeros}):{" "}
          {(numerosConfirmados.length > 0 ? numerosConfirmados : selecionados).join(", ") || "nenhum"}
        </p>

        <button onClick={confirmarAposta} disabled={!podeConfirmar} className="botao-confirmar">✅ Confirmar Aposta</button>
      </section>

      {mostrarIndicacoesInline && (
        <section className="indicacoes-inline">
          <h3>Indique seus amigos</h3>
          <IndicacoesView refAtual={refAtual} />
        </section>
      )}

      {/* exibir números confirmados */}
      {numerosConfirmados.length > 0 && (
        <div className="selected-box">
          <h3>🎯 Seus números confirmados:</h3>
          <p>{numerosConfirmados.join(", ")}</p>
        </div>
      )}

      {mostrarPaymentForm && (
        <section ref={formRef} className="payment-inline">
          <PaymentForm
            totalCompra={totalCompra}
            numerosSelecionados={numerosConfirmados}   // 👈 passando para o backend
            onSuccess={(paymentRecord) => {
              setPaymentCreated(paymentRecord);
              setMostrarIndicacoesInline(true);
              setSelecionados([]); // limpa só depois que pagou
            }}
          />
        </section>
      )}

      <section className="depoimentos-container">
        {depoimentos.map((d, idx) => (
          <div key={idx} className="depoimento shadow">
            <p>{d.texto}</p>
            <p>– {d.nome}</p>
          </div>
        ))}
      </section>
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
        <h1 className="logo">Mega da sorte POVÃO</h1>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/indicacoes">Indicações</Link>
          <Link to="/pagamento">Depósito</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/indicacoes" element={<IndicacoesViewWrapper />} />
        <Route path="/pagamento" element={<PaymentForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
    
  );
}
