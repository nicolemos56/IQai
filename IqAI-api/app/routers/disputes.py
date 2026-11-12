import logging
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Request, BackgroundTasks
from pydantic import BaseModel, Field
from app.services.dispute_service import DisputeService

logger = logging.getLogger("uvicorn.error")

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])

# Armazenamento em memória dos eventos e decisões do agente para exibição na UI
RECENT_AGENT_LOGS: List[Dict[str, Any]] = []

def add_agent_log(dispute_id: str, order_id: str, reason: str, status: str, message: str, result: Any = None):
    entry = {
        "id": f"{dispute_id}-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.now().strftime("%H:%M:%S"),
        "dispute_id": dispute_id,
        "order_id": order_id,
        "reason": reason,
        "status": status,  # "PROCESSING", "COMPLETED", "ERROR"
        "message": message,
        "result": result
    }
    RECENT_AGENT_LOGS.insert(0, entry)
    if len(RECENT_AGENT_LOGS) > 20:
        RECENT_AGENT_LOGS.pop()

class DisputeRequest(BaseModel):
    dispute_id: str = Field(default="PP-R-UHP-10194813", description="ID do litígio")
    order_id: str = Field(default="71B45819K54884907", description="ID da transação/ordem")
    reason: str = Field(
        default="MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
        description="Motivo da disputa para a IA decidir o fluxo no LangGraph"
    )

@router.get("/logs")
async def get_agent_logs():
    """Retorna o histórico em tempo real das execuções do agente (Webhooks + Sync Manual)."""
    return {"logs": RECENT_AGENT_LOGS}

@router.post("/test-create-isolated")
async def test_create_dispute_isolated(transaction_id: str = "71B45819K54884907"):
    token = await DisputeService.get_sandbox_token()
    if not token:
        return {"status": "error", "message": "Falha ao obter token OAuth do PayPal Sandbox."}
        
    result = await DisputeService.create_sandbox_dispute(token, transaction_id)
    return {
        "status": "completed",
        "transaction_id": transaction_id,
        "paypal_raw_response": result
    }

@router.post("/sync-real")
async def sync_and_analyze_disputes(payload: DisputeRequest):
    """Executa o fluxo autónomo do FaQ-IA gerido pelo LangGraph e pela IA da Groq."""
    real_dispute_id = payload.dispute_id
    real_order_id = payload.order_id
    real_reason = payload.reason

    try:
        token = await DisputeService.get_sandbox_token()
        if token:
            paypal_details = await DisputeService.fetch_dispute_details_from_paypal(token, real_dispute_id)
            if "error" not in paypal_details:
                real_reason = paypal_details.get("reason", real_reason)
                disputed_txs = paypal_details.get("disputed_transactions", [])
                if disputed_txs:
                    real_order_id = disputed_txs[0].get("seller_transaction_id", real_order_id)
            else:
                logger.info(f"ℹ️ [IQAI INFO] ID '{real_dispute_id}' não encontrado na API oficial (provavelmente ID de teste/Webhook Simulator). A prosseguir com flexibilidade usando os dados padrão fornecidos.")
    except Exception:
        pass

    add_agent_log(
        dispute_id=real_dispute_id,
        order_id=real_order_id,
        reason=real_reason,
        status="PROCESSING",
        message="Execução manual iniciada. A analisar com LangGraph..."
    )
    
    result = await DisputeService.fetch_and_process_real_disputes(
        dispute_id=real_dispute_id,
        order_id=real_order_id,
        custom_reason=real_reason
    )
    
    add_agent_log(
        dispute_id=real_dispute_id,
        order_id=real_order_id,
        reason=real_reason,
        status="COMPLETED",
        message=f"Análise concluída: {result.get('ai_decision', 'Processado')}",
        result=result
    )
    return result

async def run_dispute_agent_in_background(dispute_id: str, order_id: str, reason: str):
    """Função executada em background via Webhook do PayPal com tratamento resiliente de IDs simulados."""
    try:
        logger.info(f"🔍 [IQAI AGENT] A tentar sincronizar dados do litígio {dispute_id} na API do PayPal...")
        
        token = await DisputeService.get_sandbox_token()
        if token:
            paypal_details = await DisputeService.fetch_dispute_details_from_paypal(token, dispute_id)
            if "error" not in paypal_details:
                reason = paypal_details.get("reason", reason)
                disputed_txs = paypal_details.get("disputed_transactions", [])
                if disputed_txs:
                    order_id = disputed_txs[0].get("seller_transaction_id", order_id)
                logger.info(f"✅ [IQAI AGENT] Sincronização bem-sucedida! Motivo: {reason} | Transação: {order_id}")
            else:
                # Mensagem elegante explicando que o ID é do simulador/inventado mas a app continua a funcionar perfeitamente
                logger.info(f"💡 [IQAI FLEXÍVEL] O ID '{dispute_id}' provém do Webhook Simulator ou é um ID de teste externo (não pertence à conta Sandbox ativa). A aplicação vai funcionar de forma flexível utilizando os dados úteis recebidos no pacote do evento!")

        add_agent_log(
            dispute_id=dispute_id,
            order_id=order_id,
            reason=reason,
            status="PROCESSING",
            message=f"Webhook processado com sucesso (Motivo/Issue: {reason}). Agente IA a gerar decisão..."
        )
        
        # Executa o fluxo do LangGraph com os dados disponíveis de forma flexível
        result = await DisputeService.fetch_and_process_real_disputes(
            dispute_id=dispute_id,
            order_id=order_id,
            custom_reason=reason
        )
        
        logger.info(f"✅ [IQAI AGENT] Disputa {dispute_id} processada com sucesso em background!")
        add_agent_log(
            dispute_id=dispute_id,
            order_id=order_id,
            reason=reason,
            status="COMPLETED",
            message=f"Decisão Autónoma: {result.get('ai_decision', 'Concluído')}",
            result=result
        )
        return result
        
    except Exception as e:
        logger.error(f"❌ [IQAI AGENT] Erro no processamento em background do litígio {dispute_id}: {str(e)}")
        add_agent_log(
            dispute_id=dispute_id,
            order_id=order_id,
            reason=reason,
            status="ERROR",
            message=f"Erro no agente: {str(e)}"
        )

@router.post("/webhook/paypal")
async def paypal_webhook(request: Request, background_tasks: BackgroundTasks):
    """Recebe os eventos nativos do PayPal Sandbox (Webhooks) e aciona o agente em background."""
    try:
        payload = await request.json()
        event_type = payload.get("event_type", "")
        
        logger.info(f"🔔 [WEBHOOK] Evento recebido do PayPal: {event_type}")
        
        if "DISPUTE" in event_type:
            resource = payload.get("resource", {})
            dispute_id = resource.get("dispute_id", "PP-WEBHOOK-TEST")
            
            # Extrai com flexibilidade o motivo principal (issue / reason)
            reason = resource.get("reason") or resource.get("issue") or "MERCHANDISE_OR_SERVICE_NOT_RECEIVED"
            
            transactions = resource.get("disputed_transactions", [])
            order_id = transactions[0].get("seller_transaction_id", "ORDER-WEBHOOK-123") if transactions else "ORDER-WEBHOOK-123"

            background_tasks.add_task(
                run_dispute_agent_in_background,
                dispute_id=dispute_id,
                order_id=order_id,
                reason=reason
            )

            return {
                "status": "success",
                "message": f"Webhook {event_type} recebido com sucesso! Agente ativado em segundo plano para o Dispute ID: {dispute_id}"
            }

        return {"status": "ignored", "message": f"Evento {event_type} ignorado."}
        
    except Exception as e:
        logger.error(f"❌ [WEBHOOK] Erro ao processar o webhook do PayPal: {str(e)}")
        return {"status": "error", "message": str(e)}