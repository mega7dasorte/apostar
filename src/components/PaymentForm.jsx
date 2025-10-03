// src/components/PaymentForm.jsx
import React, { useState, useEffect, useRef } from "react";
import { createPayment } from "../services/payments";
import { registrarAposta } from "../services/betsService";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "../supabaseClient";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
function formatBRL(value) {
  if (typeof value !== "number") return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PaymentForm({ totalCompra = 0, selectedNumbers = [], onSuccess = () => {} }) {
  const [form, setForm] = useState({
    full_name: "",
    cpf: "",
    email: "",
    celular: "",
    endereco: "",
    valor: totalCompra ? Number(totalCompra).toFixed(2) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const formRef = useRef(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // 🔥 sempre que totalCompra mudar no App.jsx, atualiza o campo "valor"
  useEffect(() => {
    if (totalCompra) {
      setForm((prev) => ({ ...prev, valor: totalCompra.toFixed(2) }));
    }
  }, [totalCompra]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.full_name || !form.cpf || !form.email || !form.celular || !form.valor) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      // 1️⃣ Criar ou buscar usuário na tabela users
      let { data: existingUser, error: findUserError } = await supabase
        .from("users")
        .select("*")
        .eq("email", form.email)
        .maybeSingle();

      if (findUserError) throw new Error("Erro ao buscar usuário: " + findUserError.message);

      let userId;
      if (!existingUser) {
        // Se não existe, cria
        const { data: newUser, error: insertUserError } = await supabase
          .from("users")
          .insert([
            {
              full_name: form.full_name,
              cpf: form.cpf,
              email: form.email,
              celular: form.celular,
            },
          ])
          .select()
          .single();

        if (insertUserError) throw new Error("Erro ao criar usuário: " + insertUserError.message);

        userId = newUser.id;
      } else {
        userId = existingUser.id;
      }

      // 2️⃣ Cria pagamento no Supabase DB
      const { data: created, error: dbError } = await createPayment({
        nome: form.full_name,
        cpf: form.cpf,
        email: form.email,
        celular: form.celular,
        valor: Number(form.valor),
      });

      if (dbError) throw new Error(dbError.message || "Erro no Supabase");

      const payment = created[0];

      // 3️⃣ Cria preferência no Mercado Pago via Edge Function
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
          full_name: form.full_name,
          cpf: form.cpf,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro no Supabase: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      if (!data.init_point) throw new Error("Não foi possível obter o link de pagamento.");

      // 4️⃣ Registro da aposta com os números escolhidos
      const numerosParaRegistrar = Array.isArray(selectedNumbers)
        ? selectedNumbers.map((n) => (typeof n === "string" ? Number(n) : n))
        : [];

      await registrarAposta({
        user_id: userId, // 🔑 agora usa o id do usuário da tabela users
        numeros: numerosParaRegistrar,
        quantity_numbers: numerosParaRegistrar.length || selectedNumbers.length || 0,
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
        full_name: form.full_name,
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
      setError(err.message || "Erro ao processar pagamento. Veja o console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="payment-form" ref={formRef}>
      <h3>Pagamento</h3>

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
        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Nome completo" required />
        <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="CPF" required />
        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="E-mail" required />
        <input name="celular" value={form.celular} onChange={handleChange} placeholder="Celular" required />
        <div className="form-group" style={{ textAlign: "center" }}>
          <input
            name="valor"
            type="text"
            value={form.valor ? formatBRL(Number(form.valor)) : "R$ 0,00"}
            readOnly
            className="oferta-valor"
          />
        </div>  

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
