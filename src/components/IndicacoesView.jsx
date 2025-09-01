import { useState, useEffect } from "react";

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

  const ranking = Object.entries(lista).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const linkCompartilhar = `${window.location.origin}/?ref=${refAtual.codigo}`;

  return (
    <main className="px-6 pb-24 max-w-4xl mx-auto">
      <section className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-black text-red-700">Convide seus amigos</h2>
        <p className="mt-2 max-w-2xl mx-auto">Quanto mais pessoas você indicar, mais chances terá de ganhar no final do mês. Use seu link exclusivo abaixo.</p>
      </section>

      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <h3 className="text-xl font-bold mb-2">Seu código</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span
