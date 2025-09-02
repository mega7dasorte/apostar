import { useEffect, useState } from "react";

const LS_INDICACOES = "sf_indicacoes";

export default function IndicacoesView({ refAtual }) {
  const [lista, setLista] = useState(() => {
    const raw = localStorage.getItem(LS_INDICACOES);
    return raw ? JSON.parse(raw) : {};
  });

  useEffect(() => {
    if (!lista[refAtual.codigo]) {
      const novo = { ...lista, [refAtual.codigo]: 0 };
      setLista(novo);
      localStorage.setItem(LS_INDICACOES, JSON.stringify(novo));
    }
  }, []);

  const [novoEmail, setNovoEmail] = useState("");

  const registrarIndicacao = (e) => {
    e.preventDefault();
    const email = (novoEmail || "").trim().toLowerCase();
    if (!email || !email.includes("@")) return;
    const updated = { ...lista, [refAtual.codigo]: (lista[refAtual.codigo] || 0) + 1 };
    setLista(updated);
    localStorage.setItem(LS_INDICACOES, JSON.stringify(updated));
    setNovoEmail("");
  };

  const ranking = Object.entries(lista).sort((a,b) => b[1]-a[1]).slice(0,10);
  const linkCompartilhar = `${window.location.origin}/#/indicacoes?ref=${refAtual.codigo}`;

  return (
    <main>
      <h2>Convide seus amigos</h2>
      <p>Quanto mais pessoas você indicar, mais chances terá de ganhar no final do mês.</p>

      <div>
        <span>Código: {refAtual.codigo}</span>
        <button onClick={() => navigator.clipboard.writeText(refAtual.codigo)}>Copiar código</button>
      </div>

      <div>
        <span>Link de indicação: {linkCompartilhar}</span>
        <button onClick={() => navigator.clipboard.writeText(linkCompartilhar)}>Copiar link</button>
      </div>

      <form onSubmit={registrarIndicacao}>
        <input type="email" placeholder="email do amigo" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
        <button>Adicionar</button>
      </form>

      <h3>Ranking (top 10)</h3>
      {ranking.map(([codigo,pontos], i) => (
        <div key={codigo}>
          <span>{i+1}. {codigo}</span>
          <span>{pontos} indicações</span>
        </div>
      ))}
    </main>
  );
}
