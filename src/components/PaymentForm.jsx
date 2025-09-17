// src/components/PaymentForm.jsx
import React, { useState } from "react";
import { createPayment } from "../services/payments";
import QRCode from "react-qr-code";

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
  const [mpPayment, setMpPayment] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.nome || !form.cpf || !form.email || !form.celular || !form.valor) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Cria pagamento no Supabase DB
      const { data: created, error: dbError } = await createPayment({
        nome: form.nome,
        cpf: form.cpf,
        email: form.email,
        celular: form.celular,
        endereco: form.endereco,
        valor: Number(form.valor),
      });

      if (dbError) throw new Error(dbError.message || "Erro no Supabase");

      setPayment(created[0]);

      // 2️⃣ Cria preferência no Mercado Pago via Edge Function
      const res = await fetch(
        `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/rapid-worker`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalCompra: Number(form.valor), txid: created[0].txid }),
        }
      );

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setMpPayment(data);

      onSuccess(created[0]);
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      setError("Erro ao processar pagamento. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Tela de resultado com checkout do Mercado Pago
  if (payment && mpPayment && mpPayment.init_point) {
    return (
      <div className="payment-result">
        <h3>Pagamento registrado</h3>
        <p><strong>TXID:</strong> {payment.txid}</p>
        <p><strong>Valor:</strong> R$ {Number(payment.valor).toFixed(2)}</p>

        <div className="mercado-pago" style={{ marginTop: "1rem" }}>
          <a
            href={mpPayment.init_point}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginBottom: "1rem", fontWeight: "bold" }}
          >
            Ir para Checkout Pro
          </a>
          <QRCode value={mpPayment.init_point} size={196} />
        </div>
      </div>
    );
  }

  // ✅ Formulário de pagamento
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
          <button type="submit" disabled={loading}>
            {loading ? "Gerando..." : "Ir para Checkout Pro"}
          </button>
        </div>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </div>
  );
}