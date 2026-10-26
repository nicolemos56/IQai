import os
import httpx
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_API_BASE = os.getenv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

class DisputeService:
    
    @staticmethod
    async def get_paypal_access_token() -> str:
        """Obtém o token OAuth 2.0 real do PayPal Sandbox."""
        base_url = PAYPAL_API_BASE.strip()
        if not base_url.startswith("http://") and not base_url.startswith("https://"):
            base_url = f"https://{base_url}"
            
        url = f"{base_url}/v1/oauth2/token"
        headers = {"Accept": "application/json", "Accept-Language": "en_US"}
        data = {"grant_type": "client_credentials"}
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    url, headers=headers, data=data, 
                    auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
                )
                if response.status_code == 200:
                    return response.json().get("access_token", "")
            except Exception as e:
                print(f"Erro OAuth PayPal: {e}")
            return ""

    @staticmethod
    async def analyze_and_resolve_dispute(dispute_data: dict):
        """
        O CÉREBRO DO AGENTE AUTÓNOMO (GROQ):
        Analisa o litígio e toma decisões estratégicas dinâmicas.
        """
        reason = dispute_data.get("reason", "ITEM_NOT_RECEIVED")
        shipping_status = dispute_data.get("shipping_status", "DELIVERED")
        dispute_amount = dispute_data.get("amount", "75.00 USD")
        
        prompt = f"""
        Você é o IqAI, um agente autônomo de decisão financeira e jurídica integrado ao ecossistema do PayPal.
        
        Analise o litígio abaixo com base nas políticas do PayPal:
        - Motivo da Disputa: {reason}
        - Status Logístico: {shipping_status}
        - Valor Envolvido: {dispute_amount}

        Escolha uma das ações: CONTEST, REFUND, REQUEST_EVIDENCE ou ESCALATE_HUMAN.
        
        Sua resposta deve ser estruturada exatamente assim:
        DECISAO: [CONTEST, REFUND, REQUEST_EVIDENCE ou ESCALATE_HUMAN]
        RACIOCINIO: [Sua justificativa lógica detalhada e profissional em português]
        """
        
        try:
            client = Groq(api_key=GROQ_API_KEY)
            
            completion = client.chat.completions.create(
                model="qwen/qwen3.8-27b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=350
            )
            
            llm_output = completion.choices[0].message.content.strip()
            
            # Extrair decisão
            decision = "CONTEST"
            for action in ["REQUEST_EVIDENCE", "REFUND", "ESCALATE_HUMAN", "CONTEST"]:
                if action in llm_output:
                    decision = action
                    break

            reasoning = llm_output
        except Exception as e:
            decision = "CONTEST" if "DELIVERED" in shipping_status.upper() else "REFUND"
            reasoning = f"[Fallback Local] Erro na Groq ({str(e)}). Decisão baseada em regras locais."

        token = await DisputeService.get_paypal_access_token()
        paypal_status = "SUCESSO (OAuth PayPal OK e Groq AI Ativo)" if token else "ERRO_AUTH_PAYPAL"

        return {
            "dispute_id": dispute_data.get("dispute_id", "DISP-SANDBOX-888"),
            "order_id": dispute_data.get("order_id", "ORD-2026-REAL"),
            "reason": reason,
            "ai_decision": decision,
            "ai_reasoning": reasoning,
            "paypal_status": paypal_status
        }