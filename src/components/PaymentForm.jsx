// src/components/PaymentForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPayment } from "../services/payments";
import { registrarAposta } from "../services/betsService";
// import { enviarEmailApostador } from "../services/emailService";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabaseClient";

export default function PaymentForm({ totalCompra = 0, selectedNumbers = [], onSuccess = () => {} }) {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    celular: "",
    endereco: "",
    valor: totalCompra ? Number(totalCompra).toFixed(2) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formRef = useRef(null);

  // 🔽 Quando abrir o formulário, rola automático até ele
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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

      const payment = created[0];

      // 2️⃣ Cria preferência no Mercado Pago via Edge Function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/rapid-worker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          totalCompra: Number(form.valor),
          txid: payment.txid,
          email: form.email,
          nome: form.nome,
          cpf: form.cpf,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro no Supabase: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      if (!data.init_point) throw new Error("Não foi possível obter o link de pagamento.");

      // 3️⃣ Registro da aposta com os números escolhidos
      await registrarAposta({
        user_id: payment.id, // ou ID do usuário real se houver
        numeros: selectedNumbers, // agora salva os números escolhidos
        quantity_numbers: selectedNumbers.length,
        qty_tickets: 1,
        unit_price: Number(form.valor),
        total_price: Number(form.valor),
        status: "pending",
        pix_txid: payment.txid,
        month_year: new Date().toISOString().slice(0, 7),
      });

      // 4️⃣ Envio de e-mail de confirmação ao apostador (se quiser ativar)
      /*
      await enviarEmailApostador({
        nome: form.nome,
        email: form.email,
        txid: payment.txid,
        valor: Number(form.valor),
      });
      */

      // 5️⃣ Redireciona automaticamente para checkout Mercado Pago
      window.location.href = data.init_point;

      // 6️⃣ Callback de sucesso
      onSuccess(payment);
    } catch (err) {
      console.error("Erro ao processar pagamento:", err);
      setError("Erro ao processar pagamento. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="payment-form" ref={formRef}>
      <h3>Pagamento</h3>

      {/* 🔽 Mostrar números escolhidos antes do formulário */}
      {selectedNumbers.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <strong>Números escolhidos:</strong>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
            {selectedNumbers.map((num, idx) => (
              <span
                key={idx}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: "#eee",
                  fontWeight: "bold",
                }}
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8, maxWidth: 520 }}>
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome completo" required />
        <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF" required />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <input name="celular" value={form.celular} onChange={handleChange} placeholder="Celular" required />
        <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço (opcional)" />
        <input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} placeholder="Valor (R$)" required />

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Gerando..." : "Efetuar pagamento"}
          </button>
        </div>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </div>
  );
}
