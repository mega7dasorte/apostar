import { useState, useEffect, useMemo } from "react";
import QRCode from "react-qr-code";
import { supabase } from "./supabaseClient";
import IndicacoesView from "./components/IndicacoesView.jsx";

// ================================
// DADOS FICTÍCIOS
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
];

const rostos = Array.from({ length: 30 }, (_, i) => `https://i.pravatar.cc/300?img=${i + 1}`);

const depoimentosSeed = [
  { nome: "José, Curitiba", texto: "Com esse prêmio, comprei minha casa própria. Foi surreal ver meu nome nas mensagens!" },
  { nome: "Fernanda, Recife", texto: "Minha vida mudou para sempre. Agora sou milionária (no mundo da ficção)!" },
  { nome: "Maria, São Paulo", texto: "Realizei meus sonhos com essa sorte imaginária. Uma experiência divertida!" },
  { nome: "Igor, Belo Horizonte", texto: "Não acreditava até ver meu código Pix aparecer. Arte que brinca com expectativas." },
];

const precosPorQuantidade = { 7: 39.9, 8: 56.0, 9: 63.0, 10: 70.0 };
const opcoesPremio = [20, 30, 40];

// ================================
// STORAGE KEYS
// ================================
const LS_TOTAL_APOSTAS = "sf_total_apostas";
const LS_TOTAL_ARRECADADO = "sf_total_arrecadado";
const LS_PREMIO_ESCOLHIDO = "sf_premio_percentual";
const LS_REFERENCIA_USUARIO = "sf_user_ref";
const LS_INDICACOES = "sf_indicacoes";

// ================================
// UTILIDADES
// ================================
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatBRL(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ================================
// APP
// ================================
export default function App() {
  const [view, setView] = useState("home");
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

  const depoimentos = useMemo(() => {
    return depoimentosSeed.map((d, i) => ({ ...d, foto: rostos[i % rostos.length] }));
  }, []);

  const [refAtual, setRefAtual] = useState(() => {
    const saved = localStorage.getItem(LS_REFERENCIA_USUARIO);
    if (saved) return JSON.parse(saved);
    const novo = { id: randomUUID(), codigo: `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}` };
    localStorage.setItem(LS_REFERENCIA_USUARIO, JSON.stringify(novo));
    return novo;
  });

  // ================================
  // EFEITOS
  // ================================
  useEffect(() => {
    const intervalo = setInterval(() => {
      setMensagem(`${getRandomItem(nomesBR)} acabou de ganhar R$ 500 mil (ficção).`);
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
    if (selecionados.includes(n)) {
      setSelecionados(selecionados.filter((x) => x !== n));
    } else if (selecionados.length < qtdNumeros) {
      setSelecionados([...selecionados, n]);
    }
  };

  const podeConfirmar = selecionados.length === qtdNumeros && precoUnitario && qtdApostas >= 1 && qtdApostas <= 1000;

  const confirmarAposta = () => {
    if (!podeConfirmar) return;
    setTotalApostas((t) => t + qtdApostas);
    setTotalArrecadado((v) => v + totalCompra);
    if (qtdNumeros >= 9) setLiberouIndicacoes(true);

    const txid = randomUUID().slice(0, 25);
    setPixTxid(txid);
    const chave = "c8875076-656d-4a18-8094-c70c67dbb56c";
    const descricao = `APOSTA-${qtdNumeros}N-${qtdApostas}X`;
    const payload = `PIX-FICTICIO|BANK:pagBank|CHAVE:${chave}|TXID:${txid}|DESC:${descricao}|VLR:${totalCompra.toFixed(2)}`;
    setPixPayload(payload);

    setSelecionados([]);
  };

  const premioPrevisto = (totalArrecadado * premioPercentual) / 100;

  // ================================
  // RENDER
  // ================================
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-yellow-300 text-gray-900">
      <header className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Sorteio Fictício</h1>
        <nav className="flex items-center gap-3">
          <button className={`px-3 py-2 rounded-xl shadow ${view === "home" ? "bg-white" : "bg-white/60"}`} onClick={() => setView("home")}>Página Inicial</button>
          <button className={`px-3 py-2 rounded-xl shadow ${view === "indicacoes" ? "bg-white" : "bg-white/60"}`} disabled={!liberouIndicacoes} onClick={() => setView("indicacoes")} title={!liberouIndicacoes ? "Liberado após uma aposta de 9 ou 10 números" : "Indicar amigos"}>Indicações</button>
        </nav>
      </header>

      {view === "home" ? (
        <main className="px-6 pb-24 max-w-5xl mx-auto">
          {/* Hero */}
          <section className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-black text-red-700">Escolha seus números e participe (ficção)</h2>
            <p className="mt-2">Prêmio ilustrativo de <span className="font-bold">R$ 500.000</span>. Sem transações reais.</p>
            <p className="text-xs mt-1">Este site é uma obra artística/experimental. Nada aqui é um produto financeiro ou aposta real.</p>
          </section>

          {/* Mensagens */}
          <section className="mb-8">
            <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-3">
              <img src={mensagemFoto} alt="Rosto" className="w-12 h-12 rounded-full object-cover" />
              <p className="text-sm md:text-base font-semibold text-red-700 animate-pulse">{mensagem || "Aguardando vencedores (ficção)..."}</p>
            </div>
          </section>

          {/* Totais */}
          <section className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-sm">Total de apostas registradas*</p>
              <p className="text-2xl font-extrabold">{totalApostas.toLocaleString("pt-BR")}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-sm">Total arrecadado (fictício)</p>
              <p className="text-2xl font-extrabold">{formatBRL(totalArrecadado)}</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 text-center">
              <p className="text-sm">Prêmio do mês ({premioPercentual}%)</p>
              <p className="text-2xl font-extrabold">{formatBRL(premioPrevisto)}</p>
            </div>
          </section>

          {/* Seleção de números */}
          <section className="bg-white rounded-2xl shadow p-6 mb-8">
            <h3 className="text-xl font-bold mb-4">Monte sua aposta (ficção)</h3>
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold mb-1">Quantidade de números</label>
                <select className="w-full border rounded-xl px-3 py-2" value={qtdNumeros} onChange={(e) => { setQtdNumeros(Number(e.target.value)); setSelecionados([]); }}>
                  {Object.entries(precosPorQuantidade).map(([num, preco]) => (
                    <option key={num} value={num}>{num} números — {formatBRL(preco)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Quantidade de apostas</label>
                <input type="number" min={1} max={1000} className="w-full border rounded-xl px-3 py-2" value={qtdApostas} onChange={(e) => setQtdApostas(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))} />
                <p className="text-xs mt-1">Até 1000 apostas</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Total desta compra</p>
                <p className="text-2xl font-extrabold">{formatBRL(totalCompra)}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-10 gap-2">
              {Array.from({ length: 70 }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => toggleNumero(n)} className={`w-10 h-10 rounded-full text-sm font-bold transition ${selecionados.includes(n) ? "bg-red-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}>
                  {n}
                </button>
              ))}
            </div>

            <p className="mt-3 text-sm">Selecionados ({selecionados.length}/{qtdNumeros}): {selecionados.join(", ") || "nenhum"}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button onClick={confirmarAposta} disabled={!podeConfirmar} className="bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-2xl shadow-lg hover:scale-[1.02] transition">
                Confirmar Aposta (fictícia)
              </button>
              <div className="text-xs">
                <label className="mr-2">% do prêmio (apenas autor):</label>
                <select value={premioPercentual} onChange={(e) => setPremioPercentual(Number(e.target.value))} className="border rounded-lg px-2 py-1">
                  {opcoesPremio.map((p) => <option key={p} value={p}>{p}%</option>)}
                </select>
              </div>
            </div>

            {pixPayload && (
              <div className="mt-6 grid md:grid-cols-2 gap-6 items-center">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-bold mb-2">PIX (fictício) — Copia e Cola</h4>
                  <p className="text-xs break-all border rounded-lg p-2 bg-white">{pixPayload}</p>
                  <p className="text-xs mt-2">Banco: pagBank (fictício) • Chave: c8875076-656d-4a18-8094-c70c67dbb56c • TXID: {pixTxid}</p>
                  <p className="text-[11px] mt-2 italic">Este QR/PIX é meramente ilustrativo e não processa pagamentos reais.</p>
                </div>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center">
                  <QRCode value={pixPayload} size={196} />
                </div>
              </div>
            )}

          </section>

          {/* Depoimentos */}
          <section className="mb-16">
            <h3 cla
