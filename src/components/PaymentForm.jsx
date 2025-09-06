import React, { useState } from "react";
import { createPayment } from "../services/payments";

const PaymentForm = () => {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    celular: "",
    valor: ""
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("processando...");

    try {
      const response = await createPayment(form);
      if (response.error) throw response.error;
      setStatus("✅ Pagamento registrado! Gere o PIX para o usuário.");
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao registrar pagamento.");
    }
  };

  return (
    <div className="payment-form">
      <h2>Efetuar Pagamento</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          value={form.nome}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={form.cpf}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="celular"
          placeholder="Celular"
          value={form.celular}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="valor"
          placeholder="Valor (R$)"
          value={form.valor}
          onChange={handleChange}
          required
        />

        <button type="submit">Registrar Pagamento</button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
};

export default PaymentForm;
