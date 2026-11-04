"useState";
import { useState } from 'react';

export default function DisputePanel() {
  const [disputeId, setDisputeId] = useState("PP-R-UHP-10194813");
  const [orderId, setOrderId] = useState("71B45819K54884907");
  const [reason, setReason] = useState("MERCHANDISE_OR_SERVICE_NOT_RECEIVED");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/disputes/sync-real", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dispute_id: disputeId,
          order_id: orderId,
          reason: reason,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Erro ao comunicar com a API:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-slate-900 text-white rounded-xl shadow-2xl mt-10">
      <div className="border-b border-slate-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-indigo-400">FaQ-IA — Painel do Operador e Júri</h1>
        <p className="text-sm text-slate-400">Gestão Autónoma de Litígios com LangGraph, IA da Groq e Ferramentas de Upload</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Dispute ID (PayPal Case ID)</label>
          <input
            type="text"
            value={disputeId}
            onChange={(e) => setDisputeId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Transaction ID (Order ID)</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-1">Motivo do Litígio / Cenário da IA</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Ex: MERCHANDISE_OR_SERVICE_NOT_RECEIVED ou BUYER_CLAIMS_DAMAGED_ITEM..."
            required
          />
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? "A processar com IA e Ferramentas..." : "Executar Análise Autónoma da IA"}
          </button>
        </div>
      </form>

      {result && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 mt-6 animate-fadeIn">
          <h2 className="text-lg font-semibold text-emerald-400 mb-3">Resultado da Decisão Autónoma</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block">Decisão da IA</span>
              <span className="text-lg font-bold text-indigo-300">{result.ai_decision}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block">Próximo Passo</span>
              <span className="text-lg font-bold text-amber-300">{result.workflow_next_step}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 block">Notificação Webhook</span>
              <span className="text-lg font-bold text-emerald-300">{result.notification_sent ? "Enviada" : "Pendente"}</span>
            </div>
          </div>

          <div className="mb-4 bg-slate-900 p-3 rounded-lg border border-slate-700">
            <span className="text-xs text-slate-400 block mb-1">Raciocínio da Groq (LLM)</span>
            <p className="text-sm text-slate-200 italic">{result.ai_reasoning}</p>
          </div>

          {result.tool_output && (
            <div className="bg-indigo-950/40 border border-indigo-800/60 p-4 rounded-lg">
              <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider block mb-1">
                Ação da Ferramenta (MCP / Tool-Calling Ativa)
              </span>
              <p className="text-sm text-indigo-200 mb-2">{result.tool_output.message}</p>
              <a
                href={result.tool_output.upload_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-4 py-2 rounded transition"
              >
                Abrir Link de Upload Seguro para o Comprador ↗
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}