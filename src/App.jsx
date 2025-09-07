import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import PaymentForm from "./components/PaymentForm";

function App() {
  const [page, setPage] = useState("home");
  const [numbers, setNumbers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // 🔹 Buscar números do sorteio no Supabase
  useEffect(() => {
    const fetchNumbers = async () => {
      const { data, error } = await supabase.from("numbers").select("*");
      if (!error) setNumbers(data || []);
    };
    fetchNumbers();
  }, []);

  // 🔹 Buscar depoimentos no Supabase
  useEffect(() => {
    const fetchTestimonials = async () => {
      const { data, error } = await supabase.from("testimonials").select("*");
      if (!error) setTestimonials(data || []);
    };
    fetchTestimonials();
  }, []);

  return (
    <div>
      {/* 🔹 Navbar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 20px",
          background: "#faf3dd",
        }}
      >
        <h1 style={{ margin: 0 }}>Sorteio</h1>
        <div>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("indicacoes")}>Indicações</button>
          <button onClick={() => setPage("pagamento")}>Pagamento</button>
        </div>
      </nav>

      {/* 🔹 Página Home → Sorteio */}
      {page === "home" && (
        <div style={{ padding: "20px" }}>
          <h2>Números do Sorteio</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {numbers.map((num) => (
              <div
                key={num.id}
                style={{
                  width: "50px",
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #ccc",
                  background: num.taken ? "#f88" : "#8f8",
                }}
              >
                {num.value}
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "30px" }}>Depoimentos</h2>
          <ul>
            {testimonials.map((t) => (
              <li key={t.id}>
                <strong>{t.name}:</strong> {t.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔹 Página Indicações */}
      {page === "indicacoes" && (
        <div style={{ padding: "20px" }}>
          <h2>Indicações</h2>
          <p>Aqui ficará a lógica de indicações.</p>
        </div>
      )}

      {/* 🔹 Página Pagamento */}
      {page === "pagamento" && (
        <div style={{ padding: "20px" }}>
          <h2>Pagamento via Pix</h2>
          <PaymentForm />
        </div>
      )}
    </div>
  );
}

export default App;
