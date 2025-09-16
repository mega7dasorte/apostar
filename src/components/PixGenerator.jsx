// src/components/PixGenerator.jsx
import React from "react";
import QRCode from "react-qr-code";

/* TLV helper: id + length(2) + value */
function tlv(id, value) {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

/* CRC16 (X.25) — padrão usado no CRC do BR Code */
function crc16(payload) {
  let polynomial = 0x1021;
  let result = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    result ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      result = (result & 0x8000) !== 0 ? ((result << 1) ^ polynomial) & 0xffff : (result << 1) & 0xffff;
    }
  }
  return result.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Gera um payload BR Code (EMV) básico para PIX dinâmico com txid.
 * Só para testes; não substitui integração com PSP real.
 */
export function gerarPixPayload({ chavePix, txid, nome, valor, cidade = "SAOPAULO" }) {
  const gui = tlv("00", "BR.GOV.BCB.PIX");
  const key = tlv("01", chavePix);
  const merchantAccount = tlv("26", gui + key);
  const merchantCategory = tlv("52", "0000");
  const currency = tlv("53", "986");
  const amount = valor ? tlv("54", Number(valor).toFixed(2)) : "";
  const country = tlv("58", "BR");
  const merchantName = tlv("59", (nome || "NOME").slice(0, 25));
  const merchantCity = tlv("60", cidade.toUpperCase());
  const additional = tlv("62", tlv("05", txid)); // TXID como subtag 05

  // montar payload sem CRC
  const payloadSemCRC = tlv("00", "01") + merchantAccount + merchantCategory + currency + amount + country + merchantName + merchantCity + additional;

  // adicionar placeholder do CRC e gerar CRC real
  const payloadComCRC = payloadSemCRC + "6304";
  const crc = crc16(payloadComCRC);

  return payloadComCRC + crc;
}

export default function PixGenerator({ chavePix = "c8875076-656d-4a18-8094-c70c67dbb56c", txid, nome, valor, cidade }) {
  const payload = gerarPixPayload({ chavePix, txid, nome, valor, cidade });

  return (
    <div className="pix-generator" style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <div>
        <QRCode value={payload} size={200} />
      </div>
      <div>
        <h4>Dados PIX (teste)</h4>
        <p><strong>TXID:</strong> {txid}</p>
        <p><strong>Chave:</strong> {chavePix}</p>
        <p style={{ wordBreak: "break-word", fontSize: 12 }}>{payload}</p>
        <p style={{ fontSize: 12, color: "#666" }}>Obs: payload gerado para testes. Troque a chave pelo valor real quando for produção.</p>
      </div>
    </div>
  );
}
