// src/components/PaymentForm.jsx
import React, { useState } from "react";
import { createPayment } from "../services/payments";
import PixGenerator from "./PixGenerator";

export default function PaymentForm() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    celular: "",
    endereco: "",
    valor: "",
  });

  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // validações mínimas
    if (!form.nome || !form.cpf || !form.email || !form.celular || !form.valor) {
      alert("Preencha todos os campos obrigatórios (nome, cpf, email, celular, valor).");
      return;
    }

    setLoading(true);
    try {
      const created = await createPayment(form); // insere no Supabase
      setPayment(created);
      // NÃO limpamos aqui para que o usuário veja os dados
    } catch (err) {
      console.error("Erro criar pagamento:", err);
      alert("Erro ao criar pagamento. Veja console.");
    } finally {
      setLoading(false);
    }
  }

  // se já gerou pagamento, mostrar QR e dados
  if (payment) {
    return (
      <div>
        <h2>Pagamento criado</h2>
        <p>TXID: <strong>{payment.txid}</strong></p>
        <p>Valor: <strong>{Number(payment.valor).toFixed(2)}</strong></p>
        <PixGenerator chavePix="c8875076-656d-4a18-8094-c70c67dbb56c" txid={payment.txid} nome={payment.nome} valor={payment.valor} />
      </div>
    );
  }

  return (
    <div className="payment-form">
      <h2>Gerar PIX / Registrar pagamento</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo" required />
        <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <input name="celular" value={form.celular} onChange={handleChange} placeholder="Celular" required />
        <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço (opcional)" />
        <input name="valor" value={form.valor} onChange={handleChange} placeholder="Valor (R$) - ex: 39.90" type="number" step="0.01" required />
        <button type="submit" disabled={loading}>{loading ? "Gerando..." : "Gerar PIX"}</button>
      </form>
    </div>
  );
}