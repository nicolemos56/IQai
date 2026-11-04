import os
import httpx
import logging

logger = logging.getLogger("FaQ-IA")

async def send_faq_ia_notification(dispute_id: str, decision: str, reasoning: str, amount: str):
    # Lê exatamente a variável do .env corrigida
    webhook_url = os.getenv("ZAPIER_WEBHOOK_URL", "")
    
    payload = {
        "agent": "FaQ-IA",
        "event": "DISPUTE_DECISION_MADE",
        "dispute_id": dispute_id,
        "decision": decision,
        "reasoning": reasoning,
        "amount": amount
    }
    
    logger.info(f"[FaQ-IA ALERTA] Ação executada para a disputa {dispute_id}. Decisão: {decision}")
    
    if webhook_url:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(webhook_url, json=payload, timeout=5.0)
                logger.info(f"Notificação enviada com sucesso para o Webhook. Status: {response.status_code}")
        except Exception as e:
            logger.error(f"Falha ao enviar notificação via webhook: {e}")
            
    return payload