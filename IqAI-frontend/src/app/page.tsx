"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Estados para os cenários dinâmicos
  const [scenario, setScenario] = useState({
    reason: "ITEM_NOT_RECEIVED",
    shipping_status: "DELIVERED",
    amount: "75.00 USD"
  });

  const simulateDispute = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/disputes/test-simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dispute_id: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
          reason: scenario.reason,
          shipping_status: scenario.shipping_status,
          amount: scenario.amount
        })
      });
      const data = await response.json();
      setResult(data.agent_output);
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);
    } finally {
      setLoading(false);
    }
  };
  const syncRealPayPal = async () => {
  setLoading(true);
  try {
    const response = await fetch("http://localhost:8000/api/disputes/sync-real");
    const data = await response.json();
    alert(`Sincronização PayPal Sandbox:\n${JSON.stringify(data, null, 2)}`);
  } catch (error) {
    console.error("Erro na sincronização:", error);
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-400">IqAI (Aicai)</h1>
            <p className="text-slate-400 text-sm">Agente autónomo de disputas e finanças do PayPal</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-950 text-blue-400 border border-blue-800 rounded-full text-xs font-semibold">
              Sandbox do PayPal ativo
            </span>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-semibold">
              Motor de IA Online
            </span>
          </div>
        </header>

        {/* Action Card / Scenario Selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Simulador de Cenários Reais de Litígio</h2>
            <p className="text-slate-400 text-sm">
              Selecione as variáveis do litígio. O agente autónomo irá analisar o caso em tempo real com a Groq e decidir a estratégia ideal.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-2">MOTIVO DA DISPUTA</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200"
                value={scenario.reason}
                onChange={(e) => setScenario({ ...scenario, reason: e.target.value })}
              >
                <option value="ITEM_NOT_RECEIVED">Item Não Recebido (INR)</option>
                <option value="SNAD_DAMAGED">Produto Danificado / Incorreto</option>
                <option value="UNAUTHORIZED_TRANSACTION">Transação Não Autorizada</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">STATUS LOGÍSTICO</label>
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200"
                value={scenario.shipping_status}
                onChange={(e) => setScenario({ ...scenario, shipping_status: e.target.value })}
              >
                <option value="DELIVERED">DELIVERED (Entregue com Sucesso)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (Em Trânsito / Atrasado)</option>
                <option value="LOST">LOST (Extraviado pela Transportadora)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-2">VALOR DA TRANSAÇÃO</label>
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200"
                value={scenario.amount}
                onChange={(e) => setScenario({ ...scenario, amount: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={simulateDispute}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-3 rounded-lg transition-all shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? "O Agente Groq está a analisar..." : "Executar Análise Autônoma do Agente"}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl animate-fadeIn space-y-4">
            <h3 className="text-lg font-semibold text-emerald-400">Relatório de Decisão do Agente de IA</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">ID DA DISPUTA</span>
                <span className="font-mono text-slate-200 text-sm">{result.dispute_id}</span>
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
  <span className="text-xs text-slate-500 block mb-1">AÇÃO TOMADA</span>
  <span className={`font-bold text-sm ${
    result.ai_decision === 'CONTEST' ? 'text-blue-400' :
    result.ai_decision === 'REQUEST_EVIDENCE' ? 'text-purple-400' :
    result.ai_decision === 'REFUND' ? 'text-amber-400' : 'text-rose-400'
  }`}>
    {result.ai_decision === 'REQUEST_EVIDENCE' ? 'SOLICITAR EVIDÊNCIAS (FOTO/VÍDEO)' :
     result.ai_decision === 'CONTEST' ? 'CONTESTAR DISPUTA' :
     result.ai_decision === 'REFUND' ? 'APROVAR REEMBOLSO' : 'ESCALAR PARA REVISÃO HUMANA'}
  </span>
</div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-500 block mb-1">API DO PAYPAL - STATUS</span>
                <span className="text-emerald-400 font-mono text-xs">{result.paypal_status}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-500 block mb-1">CADEIA DE RACIOCÍNIO DO AGENTE (LLM LOG)</span>
              <p className="text-slate-300 text-sm font-mono leading-relaxed">{result.ai_reasoning}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}