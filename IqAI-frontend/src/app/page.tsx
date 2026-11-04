"use client";

import { useState } from "react";

export default function Home() {
  const [disputeId, setDisputeId] = useState("PP-R-UHP-10194813");
  const [orderId, setOrderId] = useState("71B45819K54884907");
  const [reason, setReason] = useState("MERCHANDISE_OR_SERVICE_NOT_RECEIVED");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleExecuteRealAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
    const response = await fetch("http://127.0.0.1:8000/api/disputes/sync-real", {
  method: "POST",
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    dispute_id: disputeId,
    order_id: orderId,
    reason: reason
  })
});
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Erro ao comunicar com a API:", error);
      setResult({ error: "Falha ao conectar com o backend do FaQ-IA." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0f1d] text-white p-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">IqAI (Aicai)</h1>
          <p className="text-sm text-gray-400">Agente autónomo de litígios e finanças do PayPal</p>
        </div>
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-blue-900/40 border border-blue-600 text-blue-400 text-xs rounded-full flex items-center gap-1">
            🟢 Sandbox do PayPal Ativo
          </span>
          <span className="px-3 py-1 bg-emerald-900/40 border border-emerald-600 text-emerald-400 text-xs rounded-full flex items-center gap-1">
            🟢 Motor de IA Online (Groq)
          </span>
        </div>
      </div>

      {/* Módulo Principal de Execução Real */}
      <div className="max-w-4xl mx-auto bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Painel de Ação Autónoma em Tempo Real</h2>
        <p className="text-sm text-gray-400 mb-6">
          Personaliza os parâmetros abaixo e aciona o agente para consultar transações, analisar litígios com IA e disparar ferramentas e ações no PayPal.
        </p>

        <form onSubmit={handleExecuteRealAgent} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Dispute ID (PayPal Case ID)</label>
              <input
                type="text"
                value={disputeId}
                onChange={(e) => setDisputeId(e.target.value)}
                className="w-full bg-[#030712] border border-gray-800 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Order / Transaction ID</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full bg-[#030712] border border-gray-800 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Motivo do Litígio / Cenário da IA (Reason)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#030712] border border-gray-800 rounded-lg p-2.5 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              placeholder="Ex: MERCHANDISE_OR_SERVICE_NOT_RECEIVED ou BUYER_CLAIMS_DAMAGED_ITEM..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? "A processar com IA e a sincronizar com o PayPal..." : "Executar Agente Autónomo (Modo Real Sandbox)"}
          </button>
        </form>

        {/* Exibição de Resultados Reais e Ferramentas (MCP) */}
        {result && (
          <div className="mt-6 bg-[#030712] border border-gray-800 rounded-lg p-4 font-mono text-xs text-emerald-300 overflow-x-auto space-y-4">
            <div>
              <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-wider">Resultado da Execução do Agente:</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>

            {/* Destaque visual se a ferramenta de upload for acionada (REQUEST_INFO) */}
            {result.tool_output && (
              <div className="bg-indigo-950/40 border border-indigo-800 p-4 rounded-lg text-indigo-200">
                <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1">
                  ⚡ Ação da Ferramenta Autónoma (MCP / Tool-Calling)
                </span>
                <p className="mb-2">{result.tool_output.message}</p>
                <a
                  href={result.tool_output.upload_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded transition"
                >
                  Abrir Link de Upload Seguro para o Comprador ↗
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}