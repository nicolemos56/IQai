import os
import httpx
import json
from typing import TypedDict, Literal, Optional
from langgraph.graph import StateGraph, END
from groq import Groq

# 1. Definir o Estado do Agente (O que viaja pelo grafo)
class DisputeState(TypedDict):
    dispute_id: str
    order_id: str
    amount: str
    reason: str
    ai_decision: Optional[str]
    ai_reasoning: Optional[str]
    next_action: Optional[str]

# 2. Nó de Análise Inteligente com a Groq
async def analyze_dispute_node(state: DisputeState) -> DisputeState:
    """
    Usa o modelo da Groq para ler os dados da disputa e decidir dinamicamente a ação.
    """
    api_key = os.getenv("GROQ_API_KEY")
    client = Groq(api_key=api_key)
    
    prompt = f"""
    És o IQai, um agente autónomo de resolução de litígios de comércio eletrónico.
    Analisa os dados da disputa abaixo e escolhe UMA destas três decisões exatas:
    - CONTEST (se houver evidência clara de entrega ou razão para recusar o reembolso)
    - REQUEST_INFO (se precisares de mais provas ou fotos ao comprador)
    - ESCALATE (se o caso for complexo ou houver alto risco de fraude)

    Dados do Litígio:
    - ID do Caso: {state.get('dispute_id')}
    - Transação: {state.get('order_id')}
    - Valor: {state.get('amount', 'N/A')}
    - Motivo: {state.get('reason')}

    Responde estritamente no formato JSON:
    {{"decision": "CONTEST" ou "REQUEST_INFO" ou "ESCALATE", "reasoning": "Breve explicação da decisão"}}
    """
    
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",  # Utiliza um modelo de texto válido da tua lista
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        
        state["ai_decision"] = result.get("decision", "CONTEST")
        state["ai_reasoning"] = result.get("reasoning", "Análise autónoma realizada pela IA.")
        state["next_action"] = state["ai_decision"]
    except Exception as e:
        # Fallback seguro caso a API da Groq falhe momentaneamente
        state["ai_decision"] = "CONTEST"
        state["ai_reasoning"] = f"Erro na IA ({str(e)}), aplicando contestação padrão por evidência de transporte."
        state["next_action"] = "CONTEST"
        
    return state

# 3. Nós de Ação Específica baseados na Decisão do Grafo
async def contest_dispute_action(state: DisputeState) -> DisputeState:
    state["next_action"] = "EXECUTED_CONTEST"
    return state

async def request_info_action(state: DisputeState) -> DisputeState:
    state["next_action"] = "PENDING_BUYER_PHOTO"
    return state

async def escalate_action(state: DisputeState) -> DisputeState:
    state["next_action"] = "ESCALATED_TO_HUMAN_AGENT"
    return state

# 4. Função de Decisão Condicional (Roteador do LangGraph)
def route_decision(state: DisputeState) -> Literal["contest", "request_info", "escalate"]:
    decision = state.get("ai_decision", "CONTEST")
    if decision == "REQUEST_INFO":
        return "request_info"
    elif decision == "ESCALATE":
        return "escalate"
    return "contest"

# 5. Construção e Compilação do Grafo
workflow = StateGraph(DisputeState)

workflow.add_node("analyzer", analyze_dispute_node)
workflow.add_node("contest_node", contest_dispute_action)
workflow.add_node("request_info_node", request_info_action)
workflow.add_node("escalate_node", escalate_action)

# Definir o ponto de entrada
workflow.set_entry_point("analyzer")

# Adicionar arestas condicionais baseadas na saída da IA
workflow.add_conditional_edges(
    "analyzer",
    route_decision,
    {
        "contest": "contest_node",
        "request_info": "request_info_node",
        "escalate": "escalate_node"
    }
)

workflow.add_edge("contest_node", END)
workflow.add_edge("request_info_node", END)
workflow.add_edge("escalate_node", END)

# Compilar o grafo do agente
compiled_faq_graph = workflow.compile()