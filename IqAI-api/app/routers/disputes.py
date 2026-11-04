from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.dispute_service import DisputeService


router = APIRouter(prefix="/api/disputes", tags=["Disputes"])

class DisputeRequest(BaseModel):
    dispute_id: str = Field(default="PP-R-UHP-10194813", description="ID do litígio")
    order_id: str = Field(default="71B45819K54884907", description="ID da transação/ordem")
    reason: str = Field(
        default="MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
        description="Motivo da disputa para a IA decidir o fluxo no LangGraph"
    )

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
    """
    Executa o fluxo autónomo do FaQ-IA gerido pelo LangGraph e pela IA da Groq.
    """
    return await DisputeService.fetch_and_process_real_disputes(
        dispute_id=payload.dispute_id,
        order_id=payload.order_id,
        custom_reason=payload.reason
    )
