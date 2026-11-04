from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.dispute_service import DisputeService

router = APIRouter(prefix="/api/disputes", tags=["Disputes"])

class RealDisputeRequest(BaseModel):
    dispute_id: str = Field(default="PP-R-UHP-10194813", description="ID do litígio")
    order_id: str = Field(default="71B45819K54884907", description="ID da transação")
    reason: str = Field(
        default="MERCHANDISE_OR_SERVICE_NOT_RECEIVED",
        description="Motivo do litígio"
    )
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

@router.post("/sync-real")
async def sync_real_disputes(payload: RealDisputeRequest):
    return await DisputeService.fetch_and_process_real_disputes(
        dispute_id=payload.dispute_id,
        order_id=payload.order_id,
        custom_reason=payload.reason
    )


from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.services.dispute_service import DisputeService



