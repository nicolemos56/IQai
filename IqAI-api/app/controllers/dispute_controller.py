from fastapi import APIRouter
from pydantic import BaseModel
from app.services.dispute_service import DisputeService

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])

class DisputePayload(BaseModel):
    dispute_id: str = "DISP-SANDBOX-888"
    reason: str = "ITEM_NOT_RECEIVED"
    shipping_status: str = "DELIVERED"
    amount: str = "75.00 USD"

@router.post("/test-simulate")
async def test_simulate_dispute(payload: DisputePayload = None):
    data = payload.dict() if payload else {}
    result = await DisputeService.analyze_and_resolve_dispute(data)
    return {"message": "Disputa processada com sucesso!", "agent_output": result}

@router.get("/sync-real")
async def sync_real_disputes():
    """Endpoint para consultar e sincronizar litígios reais no PayPal Sandbox."""
    result = await DisputeService.fetch_and_process_real_disputes()
    return result