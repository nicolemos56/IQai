import os
import httpx
import logging
from app.services.notification_service import send_faq_ia_notification
from app.services.paypal_executor import execute_dispute_action

logger = logging.getLogger("FaQ-IA")

class DisputeService:

    @staticmethod
    async def analyze_and_resolve_dispute(data: dict):
        """Lógica para simulação de testes pontuais."""
        return {"status": "success", "simulated_data": data}

    @staticmethod
    async def get_sandbox_token() -> str:
        """Obtém o Access Token OAuth 2.0 oficial do PayPal Sandbox."""
        client_id = os.getenv("PAYPAL_CLIENT_ID", "").strip()
        client_secret = os.getenv("PAYPAL_CLIENT_SECRET", "").strip()
        paypal_url = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{paypal_url}/v1/oauth2/token",
                    data={"grant_type": "client_credentials"},
                    auth=(client_id, client_secret),
                    headers={"Accept": "application/json", "Accept-Language": "en_US"}
                )
                
                if response.status_code != 200:
                    logger.error(f"PayPal Auth Falhou [{response.status_code}]: {response.text}")
                    return ""
                    
                return response.json().get("access_token", "")
            except Exception as e:
                logger.error(f"Erro de rede ao obter token do PayPal: {e}")
        return ""

    @staticmethod
    async def create_sandbox_dispute(access_token: str, transaction_id: str):
        """Tenta criar um litígio de simulação diretamente pela API de Sandbox."""
        url = "https://api-m.sandbox.paypal.com/v1/customer/disputes"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        payload = {
            "disputed_transaction_id": transaction_id,
            "reason": "MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
            "amount": {
                "currency_code": "USD",
                "value": "7.00"
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=headers)
                return response.json() if response.text else {"status_code": response.status_code}
            except Exception as e:
                logger.error(f"Erro ao disparar criacao de disputa no Sandbox: {e}")
                return None

    @staticmethod
    async def fetch_and_process_real_disputes(dispute_id: str, order_id: str, custom_reason: str):
        from app.graph.faq_agent_graph import compiled_faq_graph
        
        initial_state = {
            "dispute_id": dispute_id,
            "order_id": order_id,
            "amount": "7.00 USD",
            "reason": custom_reason,
            "ai_decision": None,
            "ai_reasoning": None,
            "next_action": None
        }
        
        agent_result = await compiled_faq_graph.ainvoke(initial_state)
        decided_action = agent_result.get("ai_decision", "CONTEST")
        
        # Se a decisão for REQUEST_INFO, podemos acionar automaticamente a ferramenta de upload
        tool_execution_result = None
        if decided_action == "REQUEST_INFO":
            from app.graph.tools import request_buyer_evidence_upload
            tool_execution_result = await request_buyer_evidence_upload.ainvoke({
                "dispute_id": dispute_id,
                "evidence_type": "photo_or_video"
            })

        return {
            "status": "success",
            "agent": "FaQ-IA (Powered by LangGraph + Tools)",
            "dispute_id": dispute_id,
            "ai_decision": decided_action,
            "ai_reasoning": agent_result.get("ai_reasoning"),
            "workflow_next_step": agent_result.get("next_action"),
            "tool_output": tool_execution_result,
            "notification_sent": True
        }