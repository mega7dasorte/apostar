//src/app.jsx
import { useEffect, useMemo, useState,useRef } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import QRCode from "react-qr-code";
import IndicacoesView from "./IndicacoesView";
import Dashboard from "./Dashboard";
import PaymentForm from "./components/PaymentForm";
import React from "react";
import logo from "./logo.png";
import certificado from "./certificado.png";

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

  const VISIBLE_WINNERS = 3;
  const COLUMN_COUNT = 4;
  const INITIAL_QUEUE_LENGTH = 7;

  function makeWinner() {
    return {
      id: randomUUID(),
      nome: getRandomItem(nomesBR),
      valor: (Math.floor(Math.random() * 900) + 100) * 1000, // ex: 100.000..999.000
      foto: getRandomItem(rostos),
      isNew: false,
    };
  }

  // estado com colunas de vencedores (cada coluna é um array de N itens)
  const [winnersCols, setWinnersCols] = useState(() =>
    Array.from({ length: COLUMN_COUNT }).map(() =>
      Array.from({ length: INITIAL_QUEUE_LENGTH }).map(() => makeWinner())
    )
  );

  // lógica para "puxar" um novo vencedor em cada coluna em timers diferentes
  useEffect(() => {
    const timers = [];

    for (let colIdx = 0; colIdx < COLUMN_COUNT; colIdx++) {
      // cada coluna atualiza em um ritmo ligeiramente diferente (para parecer natural)
      const base = 2800; // tempo base
      const jitter = Math.floor(Math.random() * 800); // pequena aleatoriedade
      const intervalMs = base + colIdx * 700 + jitter;

      const t = setInterval(() => {
        setWinnersCols((prev) =>
          prev.map((col, idx) => {
            if (idx !== colIdx) return col;
            const newTop = { ...makeWinner(), isNew: true };
            const next = [newTop, ...col.slice(0, col.length - 1)];
            return next;
          })
        );

        // limpa a flag isNew após a animação (caso precise remover classe)
        setTimeout(() => {
          setWinnersCols((prev) =>
            prev.map((col, idx) =>
              idx !== colIdx ? col : col.map((it) => ({ ...it, isNew: false }))
            )
          );
        }, 900);
      }, intervalMs);

      timers.push(t);
    }

    return () => timers.forEach(clearInterval);
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
        <p className="hero-subtitle">
          Prêmios de até <strong className="highlight-light">R$ 500.000</strong> — ENTRE AGORA e transforme sua vida. Vagas por sorteio são limitadas!
        </p>
        <p className="text-xs disclaimer"></p>
      </section>

      {/* MENSAGENS DE GANHADORES */}
      <section className="mensagem-container">
        <div className="mensagem-head">
          <h2 className="mensagem-titulo">
            <span className="spark">🔥</span>{" "}
            <span className="highlight">Últimos Ganhadores</span> — veja quem ganhou
            agora!
          </h2>
          <p className="mensagem-sub">
            A sorte pode ser sua a qualquer momento — <span className="cta">jogue já</span>!
          </p>
        </div>

        <div className="grid-ganhadores">
          {winnersCols.map((col, colIdx) => (
            <div key={colIdx} className="coluna-ganhadores" aria-hidden={false}>
              {col.slice(0, VISIBLE_WINNERS).map((win, idx) => (
                <div
                  key={win.id}
                  className={`ganhador-item ${win.isNew ? "is-new" : ""}`}
                  aria-live="polite"
                >
                  <img src={win.foto} alt={`foto ${win.nome}`} className="ganhador-foto" />
                  <div className="ganhador-info">
                    <div className="ganhador-nome">{win.nome}</div>
                    <div className="ganhador-premio">
                      <span className="badge">JÁ GANHOU!</span>
                      <span className="valor">{formatBRL(win.valor)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>


      {/* TOTAIS */}
      <section className="totais-container" style={{ margin: "2.5rem 0" }}>
        <div>Total de apostas: <strong>{Number(totalApostas).toLocaleString()}0000</strong></div>
        <div className="premio-mes">Prêmio do mês: <strong class="highlight">{formatBRL(premioPrevisto * 1000)}</strong></div>
      </section>

      {/* APOSTAS */}
      <section className="aposta-container">
        <div className="aposta-opcoes">
          <label>Quantidade de números</label>
          <select value={qtdNumeros} 
              onChange={(e) => {
                setQtdNumeros(Number(e.target.value));
                setSelecionados([]);        // limpa a grid
                setNumerosConfirmados([]);  // limpa números confirmados
                setMostrarPaymentForm(false); // fecha o form até confirmar de novo
              }}
          >
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

      {mostrarPaymentForm && (
        <section ref={formRef} className="payment-inline">
          <PaymentForm
            totalCompra={totalCompra}
            selectedNumbers={numerosConfirmados}   // 👈 passando para o backend
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

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-logo">
            <img src={logo} alt="Mega da Sorte" />  
            <p className="slogan">Mega da Sorte — A sorte pode estar a um clique!</p>
          </div>

          <div className="footer-links">
            <h4>Institucional</h4>
            <ul>
              <li><a href="/sobre">Sobre Nós</a></li>
              <li><a href="/como-jogar">Como Jogar</a></li>
              <li><a href="/politica-privacidade">Política de Privacidade</a></li>
              <li><a href="/termos">Termos & Condições</a></li>
              <li><a href="/responsabilidade">Jogo Responsável</a></li>
            </ul>
          </div>

          <div className="footer-contato">
            <h4>Atendimento</h4>
            <ul>
              <li>Email: suporte@megadasorte.com</li>
              <li>WhatsApp: (11) 99999-9999</li>
              <li>Horário: 24h, todos os dias</li>
            </ul>
          </div>

          <div className="footer-social">
            <h4>Siga-nos</h4>
            <div className="social-icons">
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-tiktok"></i></a>
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-x-twitter"></i></a>
            </div>
          </div>
        </div>

        <div className="footer-middle">
          <div className="footer-certificacoes">
            <img src={certificado} alt="Certificação" style={{width:'6rem'}}/>  
            <p>Autorizado e regulado pela legislação brasileira.</p>
          </div>
          <div className="responsible-play">
            <span>🔞 18+ | Jogue com responsabilidade</span>
            <p>O jogo é para maiores de idade. Se sentir que perdeu o controle, procure ajuda em nossa seção de <a href="/responsabilidade">Jogo Responsável</a>.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Mega da Sorte. Todos os direitos reservados.  
            Operado por Mega Sorte Brasil LTDA. CNPJ nº 55.459.453/0001-72.  
            Endereço: Av. Paulista, 1000 — São Paulo/SP.  
          </p>
        </div>
      </footer>

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
        <div className="header-left">
          <h1 className="logo">🎲 Mega da Sorte</h1>
          <p className="slogan">Sua sorte começa aqui — rápido, seguro e 100% sigiloso</p>
        </div>

        <nav className="nav">
          <Link to="/">🏠 Jogar na MEGA da SORTE</Link>
          <Link to="/indicacoes">👥 Indicações</Link>
          <Link to="/pagamento">💳 Depósito</Link>
        </nav>
      </header>

      <div className="header-info">
        <span>🔒 Seus dados são totalmente sigilosos</span>
        <span>🔞 Apenas maiores de 18 anos podem jogar</span>
      </div>

      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/indicacoes" element={<IndicacoesViewWrapper />} />
        <Route path="/pagamento" element={<PaymentForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
    
  );
}
