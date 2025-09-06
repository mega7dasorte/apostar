import { supabase } from "../supabaseClient";

// 🔑 Chave PIX fictícia (trocar depois pela real)
const PIX_KEY = "chave-pix-ficticia@provedor.com";

export async function createPayment({ nome, cpf, email, celular, valor }) {
  const txid = crypto.randomUUID(); // ID único para a transação

  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        nome,
        cpf,
        email,
        celular,
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
