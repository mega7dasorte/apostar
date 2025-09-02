import { useState, useEffect } from "react";

export default function IndicacoesView({ refAtual }) {
  const LS_INDICACOES = "sf_indicacoes";

  const [lista, setLista] = useState(() => {
    const raw = localStorage.getItem(LS_INDICACOES);
    return raw ? JSON.parse(raw) : {};
  });

  // garante que o código do usuário exista no ranking
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

  // ranking top 10
  const ranking = Object.entries(lista)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const linkCompartilhar = `${window.location.origin}/?ref=${refAtual.codigo}`;

  return (
    <main className="indicacoes-container">
      <section className="hero mb-6 text-center">
        <h2>Convide seus amigos</h2>
        <p className="max-w-2xl mx-auto">
          Quanto mais pessoas você indicar, mais chances terá de ganhar no final do mês. Use seu link de indicação exclusivo abaixo para compartilhar.
        </p>
      </section>

      <section className="indicacoes-form mb-8">
        <h3>Seu código</h3>
        <div className="flex gap-2 flex-wrap">
          <span className="codigo-box">{refAtual.codigo}</span>
          <button className="btn-copiar" onClick={() => navigator.clipboard.writeText(refAtual.codigo)}>Copiar código</button>
        </div>

        <h4 className="mt-4">Link de indicação</h4>
        <div className="flex gap-2 flex-wrap">
          <span className="link-box">{linkCompartilhar}</span>
          <button className="btn-copiar" onClick={() => navigator.clipboard.writeText(linkCompartilhar)}>Copiar link</button>
        </div>

        <form onSubmit={registrarIndicacao} className="mt-6">
          <label>Registrar uma indicação (simulado)</label>
          <div className="flex gap-2 mt-2">
            <input
              type="email"
              placeholder="email do amigo"
              className="flex-1 input-email"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
            />
            <button className="btn-adicionar">Adicionar</button>
          </div>
          <p className="text-xs mt-1">Apenas demonstrativo: os contatos não são enviados a nenhum servidor.</p>
        </form>
      </section>

      <section className="ranking mb-8">
        <h3>Ranking (top 10)</h3>
        <div className="ranking-list">
          {ranking.map(([codigo, pontos], i) => (
            <div key={codigo} className="ranking-item">
              <div className="flex items-center gap-3">
                <span className="posicao">{i + 1}</span>
                <span className="codigo">{codigo}</span>
              </div>
              <span className="pontos">{pontos} indicações</span>
            </div>
          ))}
          {ranking.length === 0 && <p className="text-sm text-gray-600 mt-2">Sem indicações ainda.</p>}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-700 mt-8">
        As indicações registradas aqui são apenas contadores locais para fins demonstrativos.
      </footer>
    </main>
  );
}
