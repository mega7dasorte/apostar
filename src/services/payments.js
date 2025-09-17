import { supabase } from "../supabaseClient";

// 🔑 Chave PIX fictícia (trocar depois pela real)
const PIX_KEY = "c8875076-656d-4a18-8094-c70c67dbb56c";

export async function createPayment({ nome, cpf, email, celular, endereco, valor }) {
  const txid = crypto.randomUUID(); // ID único para a transação

  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        nome,
        cpf,
        email,
        celular,
        endereco,
        valor,
        txid,
        status: "pendente",
      },
    ])
    .select();

  return { data, error };
}

export async function getPayments() {
  const { data, error } = await supabase.from("payments").select("*");
  return { data, error };
}

export { PIX_KEY };
