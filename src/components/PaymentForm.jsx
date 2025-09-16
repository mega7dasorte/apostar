// src/components/PaymentForm.jsx
import React, { useState } from "react";
import { createPayment } from "../services/payments";
import PixGenerator from "./PixGenerator";

export default function PaymentForm({ totalCompra = 0, onSuccess = () => {} }) {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    celular: "",
    endereco: "",
    valor: totalCompra ? Number(totalCompra).toFixed(2) : "",
  });
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // validação mínima
    if (!form.nome || !form.cpf || !form.email || !form.celular || !form.valor) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      // createPayment retorna o registro criado (do supabase)
      const created = await createPayment({
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        celular: form.celular,
        endereco: form.endereco,
        valor: Number(form.valor),
      });

      setPayment(created);
      onSuccess(created); // notifica o App.jsx
    } catch (err) {
      console.error("Erro ao criar pagamento:", err);
      setError("Erro ao processar pagamento. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  // após gerar, mostra QR + dados
  if (payment) {
    return (
      <div className="payment-result">
        <h3>Pagamento registrado</h3>
        <p><strong>TXID:</strong> {payment.txid}</p>
        <p><strong>Valor:</strong> R$ {Number(payment.valor).toFixed(2)}</p>
        <PixGenerator chavePix="c8875076-656d-4a18-8094-c70c67dbb56c" txid={payment.txid} nome={payment.nome} valor={payment.valor} />
      </div>
    );
  }

  return (
    <div className="payment-form">
      <h3>Pagamento</h3>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo" required />
        <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF" required />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <input name="celular" value={form.celular} onChange={handleChange} placeholder="Celular" required />
        <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço (opcional)" />
        <input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} placeholder="Valor (R$)" required />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading}>{loading ? "Gerando..." : "Gerar PIX e Registrar"}</button>
        </div>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </div>
  );
}
