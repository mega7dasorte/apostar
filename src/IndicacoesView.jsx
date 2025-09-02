import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function IndicacoesView({ refAtual }) {
  const [lista, setLista] = useState({});

  useEffect(() => {
    // Puxar dados do Supabase
    async function fetchIndicacoes() {
      const { data, error } = await supabase
        .from("indicacoes")
        .select("*");
      if (error) console.error(error);
      else {
        const map = {};
        data.forEach((row) => {
          map[row.codigo_usuario] = row.quantidade;
        });
        setLista(map);
      }
    }
    fetchIndicacoes();
  }, []);

  const [novoEmail, setNovoEmail] = useState("");

  const registrarIndicacao = async (e) => {
    e.preventDefault();
    const email = (novoEmail || "").trim().toLowerCase();
    if (!email || !email.includes("@")) return;

    const quantidadeAtual = lista[refAtual.codigo] || 0;

    const { data, error } = await supabase
      .from("indicacoes")
      .upsert({ codigo_usuario: refAtual.codigo, quantidade: quantidadeAtual + 1 });

    if (error) console.error(error);
    else setLista(prev => ({ ...prev, [refAtual.codigo]: quantidadeAtual + 1 }));

    setNovoEmail("");
  };

  const ranking = Object.entries(lista)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const linkCompartilhar = `${window.location.origin}/?ref=${refAtual.codigo}`;

  return (
    <main className="px-6 pb-24 max-w-4xl mx-auto">
      <section className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-black text-red-700">Convide seus amigos</h2>
        <p className="mt-2 max-w-2xl mx-auto">
          Quanto mais pessoas você indicar, mais chances terá de ganhar no final do mês. Use seu link de indicação exclusivo abaixo.
        </p>
      </section>

      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <h3 className="text-xl font-bold mb-2">Seu código</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-2 rounded-xl bg-gray-100 font-mono text-sm">{refAtual.codigo}</span>
          <button onClick={() => navigator.clipboard.writeText(refAtual.codigo)} className="px-3 py-2 rounded-xl bg-gray-900 text-white">Copiar código</button>
        </div>

        <h4 className="font-semibold mt-4">Link de indicação</h4>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-2 rounded-xl bg-gray-100 font-mono text-xs break-all">{linkCompartilhar}</span>
          <button onClick={() => navigator.clipboard.writeText(linkCompartilhar)} className="px-3 py-2 rounded-xl bg-gray-900 text-white">Copiar link</button>
        </div>

        <form onSubmit={registrarIndicacao} className="mt-6">
          <label className="block text-sm font-semibold mb-1">Registrar uma indicação</label>
          <div className="flex gap-2">
            <input type="email" placeholder="email do amigo" className="flex-1 border rounded-xl px-3 py-2" value={novoEmail} onChange={(e) => setNovoEmail(e.target.value)} />
            <button className="px-4 py-2 rounded-xl bg-green-600 text-white">Adicionar</button>
          </div>
          <p className="text-xs mt-1">Apenas demonstrativo: os contatos não são enviados a nenhum servidor.</p>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h3 className="text-xl font-bold mb-4">Ranking (top 10)</h3>
        <div className="divide-y">
          {ranking.map(([codigo, pontos], i) => (
            <div key={codigo} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold">{i + 1}</span>
                <span className="font-mono">{codigo}</span>
              </div>
              <span className="text-sm">{pontos} indicações</span>
            </div>
          ))}
          {ranking.length === 0 && <p className="text-sm text-gray-600">Sem indicações ainda.</p>}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-700 mt-8">
        As indicações registradas aqui são apenas contadores para fins demonstrativos.
      </footer>
    </main>
  );
}
