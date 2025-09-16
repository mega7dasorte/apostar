// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ✅ Substitua pelo seu Access Token (somente aqui, nunca no front)
const ACCESS_TOKEN = "APP_USR-2645677438289627-091617-6eb48556b93188b9f1077a2c12513a24-2697077260";

// Rota para criar pagamento
app.post("/create-payment", async (req, res) => {
  try {
    const { totalCompra } = req.body;
    if (!totalCompra) return res.status(400).json({ error: "totalCompra é obrigatório" });

    const body = {
      items: [
        {
          title: "Aposta fictícia",
          quantity: 1,
          currency_id: "BRL",
          unit_price: parseFloat(totalCompra),
        },
      ],
      // Configuração opcional de back URLs
      back_urls: {
        success: "https://seu-site.com/sucesso",
        pending: "https://seu-site.com/pending",
        failure: "https://seu-site.com/failure",
      },
      auto_return: "approved",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return res.json({ init_point: data.init_point, sandbox_init_point: data.sandbox_init_point, id: data.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
});

app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
