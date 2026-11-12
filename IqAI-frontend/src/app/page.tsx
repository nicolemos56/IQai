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

export default function Home() {
  const [disputeId, setDisputeId] = useState("PP-R-UHP-10194813");
  const [orderId, setOrderId] = useState("71B45819K54884907");
  const [reason, setReason] = useState("MERCHANDISE_OR_SERVICE_NOT_RECEIVED");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isPolling, setIsPolling] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://iqai-n0m8.onrender.com";

  // Polling automático em segundo plano para capturar Webhooks e tarefas assíncronas do agente
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/disputes/logs`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        // Silencia erros de rede intermitentes durante o polling
      }
    };

    fetchLogs();
    if (!isPolling) return;

    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, [API_URL, isPolling]);

  const handleExecuteRealAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/disputes/sync-real`, {
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
    <main className="min-h-screen bg-[#0a0f1d] text-white p-6 md:p-8">
      {/* Cabeçalho */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-emerald-400">IqAI (Aicai) — Painel do Operador e Júri</h1>
          <p className="text-sm text-gray-400">Agente autónomo de litígios e finanças com LangGraph e Groq LLM</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1.5 bg-blue-900/40 border border-blue-600/70 text-blue-300 text-xs rounded-full flex items-center gap-1.5">
            🟢 Sandbox do PayPal Ativo
          </span>
          <span className="px-3 py-1.5 bg-emerald-900/40 border border-emerald-600/70 text-emerald-300 text-xs rounded-full flex items-center gap-1.5">
            🟢 Motor de IA Online (Groq)
          </span>
        </div>
      </div>

      {/* Grid Principal: Esquerda (Ação & Resultados) | Direita (Feed de Webhooks e Logs) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda: Painel de Ação Autónoma (7 colunas) */}
        <div className="lg:col-span-7 bg-[#111827] border border-gray-800 rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-indigo-300">Painel de Ação Autónoma em Tempo Real</h2>
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
          </div>

          {/* Exibição de Resultados Reais e Ferramentas (MCP) */}
          {result && (
            <div className="bg-[#030712] border border-gray-800 rounded-lg p-4 font-mono text-xs text-emerald-300 overflow-x-auto space-y-4">
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

        {/* Coluna Direita: Monitor de Webhooks e Logs em Tempo Real para os Jurados (5 colunas) */}
        <div className="lg:col-span-5 bg-[#111827] border border-gray-800 p-6 rounded-xl shadow-xl flex flex-col">
          <div className="flex justify-between items-center border-b border-gray-800 pb-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Atividade em Tempo Real
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Feed automático de Webhooks do PayPal</p>
            </div>

            <button
              type="button"
              onClick={() => setIsPolling(!isPolling)}
              className={`text-xs px-2.5 py-1 rounded border transition ${
                isPolling
                  ? "bg-emerald-950/50 border-emerald-700 text-emerald-300"
                  : "bg-gray-800 border-gray-700 text-gray-400"
              }`}
            >
              {isPolling ? "Live Sync ON" : "Pausado"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[580px] pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-16 px-4 border border-dashed border-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">A aguardar eventos do PayPal...</p>
                <p className="text-xs text-gray-500">
                  Dispare um evento no Webhook Simulator do PayPal para ver o agente processar em background aqui.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => log.result && setResult(log.result)}
                  className={`p-3.5 rounded-lg border transition cursor-pointer ${
                    log.status === "COMPLETED"
                      ? "bg-[#030712] border-gray-800 hover:border-emerald-500/60"
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
                      <span className="text-[11px] font-mono text-gray-500">{log.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-200 mb-1.5">{log.message}</p>

                  <div className="flex justify-between items-center text-[11px] text-gray-500 font-mono">
                    <span className="truncate max-w-[220px]">{log.reason}</span>
                    {log.result && <span className="text-emerald-400 hover:underline">Ver detalhes →</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </main>
  );
}