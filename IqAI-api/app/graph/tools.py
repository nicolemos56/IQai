import logging
from langchain_core.tools import tool

logger = logging.getLogger("FaQ-IA-Tools")

@tool
async def request_buyer_evidence_upload(dispute_id: str, evidence_type: str = "photo") -> dict:
    """
    Utiliza esta ferramenta quando o agente precisa de solicitar ao comprador provas adicionais 
    (como fotografias, vídeos ou documentos) para resolver o litígio no PayPal.
    """
    logger.info(f"[TOOL] A gerar link seguro de upload de {evidence_type} para a disputa {dispute_id}")
    
    # Aqui podes simular a geração de um link de upload seguro ou chamada à API do PayPal
    return {
        "status": "success",
        "action": "UPLOAD_LINK_GENERATED",
        "dispute_id": dispute_id,
        "upload_url": f"https://sandbox.paypal.com/disputes/upload/{dispute_id}",
        "message": f"Solicitação de {evidence_type} enviada com sucesso ao comprador."
    }