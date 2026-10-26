from pydantic import BaseModel
from typing import Optional

class DisputeModel(BaseModel):
    dispute_id: str
    order_id: str
    buyer_email: str
    dispute_amount: float
    reason: str  # Ex: ITEM_NOT_RECEIVED, SIGNIFICANTLY_NOT_AS_DESCRIBED
    status: str = "OPEN"
    tracking_number: Optional[str] = None
    shipping_status: Optional[str] = None
    ai_decision: Optional[str] = None
    ai_reasoning: Optional[str] = None