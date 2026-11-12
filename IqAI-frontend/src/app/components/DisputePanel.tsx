"use client";

import { useState, useEffect } from "react";

interface AgentLog {
  id: string;
  timestamp: string;
  dispute_id: string;
  order_id: string;
  reason: string;
  status: "PROCESSING" | "COMPLETED" | "ERROR";
  message: string;
  result?: any;
}

export default function DisputePanel() {
  const [disputeId, setDisputeId] = useState("PP-R-UHP-10194813");
  const [orderId, setOrderId] = useState("71B45819K54884907");
  const [reason, setReason] = useState("MERCHANDISE_OR_SERVICE_NOT_RECEIVED");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isPolling, setIsPolling] = useState(true);

 const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://iqai-n0m8.onrender.com";

  // Polling automático para capturar Webhooks do PayPal e processos em background
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/disputes/logs`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        // Silencia erros intermitentes de rede durante polling
      }
    };

    fetchLogs();
    if (!isPolling) return;

    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [API_URL, isPolling]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/disputes/sync-real`, {
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
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Coluna Esquerda: Controlo Manual e Resultado Detalhado (7 colunas) */}
      <div className="lg:col-span-7 bg-[#111827] border border-slate-800 p-6 rounded-xl shadow-2xl">
        <div className="border-b border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-bold text-indigo-400">Simulador & Execução Autónoma</h2>
          <p className="text-xs text-slate-400 mt-1">
            Dispare uma análise manual ou aguarde por eventos automáticos via Webhook do PayPal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Dispute ID (PayPal Case ID)</label>
            <input
              type="text"
              value={disputeId}
              onChange={(e) => setDisputeId(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Transaction ID (Order ID)</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1">Motivo do Litígio / Cenário da IA</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#030712] border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Ex: MERCHANDISE_OR_SERVICE_NOT_RECEIVED..."
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 shadow-lg"
            >
              {loading ? "A processar com LangGraph e Groq..." : "Executar Análise Autónoma da IA"}
            </button>
          </div>
        </form>

        {/* Cartão de Decisão da IA */}
        {result && (
          <div className="bg-[#030712] border border-slate-800 rounded-xl p-5 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                Decisão do Agente Autónomo
              </h3>
              {result.dispute_id && (
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded">
                  {result.dispute_id}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Decisão da IA</span>
                <span className="text-base font-bold text-indigo-300">{result.ai_decision || "N/A"}</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Próximo Passo</span>
                <span className="text-base font-bold text-amber-300">{result.workflow_next_step || "N/A"}</span>
              </div>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block">Notificação Webhook</span>
                <span className="text-base font-bold text-emerald-300">
                  {result.notification_sent ? "Enviada" : "Processada"}
                </span>
              </div>
            </div>

            {result.ai_reasoning && (
              <div className="mb-4 bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">Raciocínio Jurídico/Operacional (Groq LLM)</span>
                <p className="text-sm text-slate-200 leading-relaxed">{result.ai_reasoning}</p>
              </div>
            )}

            {result.tool_output && (
              <div className="bg-indigo-950/40 border border-indigo-800/60 p-4 rounded-lg">
                <span className="text-xs text-indigo-300 font-semibold uppercase tracking-wider block mb-1">
                  ⚡ Ação da Ferramenta (MCP / Tool-Calling Ativa)
                </span>
                <p className="text-sm text-indigo-200 mb-3">{result.tool_output.message}</p>
                {result.tool_output.upload_url && (
                  <a
                    href={result.tool_output.upload_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-4 py-2 rounded transition text-white"
                  >
                    Abrir Link de Upload Seguro para o Comprador ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coluna Direita: Feed de Webhooks & Logs em Tempo Real (5 colunas) */}
      <div className="lg:col-span-5 bg-[#111827] border border-slate-800 p-6 rounded-xl shadow-2xl flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Atividade em Tempo Real
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Monitor de Webhooks & Background Tasks</p>
          </div>

          <button
            type="button"
            onClick={() => setIsPolling(!isPolling)}
            className={`text-xs px-2.5 py-1 rounded border transition ${
              isPolling
                ? "bg-emerald-950/50 border-emerald-700 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {isPolling ? "Live Sync ON" : "Pausado"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 max-h-[540px] pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">A aguardar eventos do PayPal...</p>
              <p className="text-xs text-slate-500">
                Dispare um webhook no PayPal Sandbox ou execute uma análise ao lado para ver o agente em ação.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                onClick={() => log.result && setResult(log.result)}
                className={`p-3.5 rounded-lg border transition cursor-pointer ${
                  log.status === "COMPLETED"
                    ? "bg-[#030712] border-slate-800 hover:border-indigo-500/60"
                    : log.status === "PROCESSING"
                    ? "bg-amber-950/20 border-amber-800/50"
                    : "bg-red-950/20 border-red-800/50"
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-xs font-bold text-indigo-300">{log.dispute_id}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === "COMPLETED"
                          ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50"
                          : log.status === "PROCESSING"
                          ? "bg-amber-900/50 text-amber-300 border border-amber-700/50"
                          : "bg-red-900/50 text-red-300 border border-red-700/50"
                      }`}
                    >
                      {log.status === "COMPLETED"
                        ? "CONCLUÍDO"
                        : log.status === "PROCESSING"
                        ? "A PROCESSAR"
                        : "ERRO"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 mb-1.5">{log.message}</p>

                <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono">
                  <span className="truncate max-w-[200px]">{log.reason}</span>
                  {log.result && <span className="text-indigo-400 hover:underline">Ver detalhes →</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}