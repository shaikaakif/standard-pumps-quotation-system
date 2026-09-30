import datetime
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.services.history_service import HistoryService

router = APIRouter(prefix="/history", tags=["Estimate History Engine"])


# --- Pydantic Schemas for Response Validation ---


class HistoryItemSchema(BaseModel):
    """
    Schema for listing individual historical quotation items.
    """

    quotation_id: str
    customer_name: str
    phone: str
    feet: int
    mode: str
    grand_total: float
    status: str
    created_at: datetime.datetime
    last_opened_at: Optional[datetime.datetime] = None
    pdf_path: Optional[str] = None

    class Config:
        from_attributes = True


class HistoryListResponse(BaseModel):
    """
    Pagination-wrapped historical items list matching infinite scroll requirements.
    """

    items: List[HistoryItemSchema]
    total: int
    limit: int
    offset: int


# --- API Routes ---


@router.get("", response_model=HistoryListResponse, status_code=status.HTTP_200_OK)
def get_quotation_history(
    q: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """
    Retrieves all active historical estimates.
    Supports instant query search (`q`) and returns pagination indexes for PWA scrolling.
    """
    try:
        # Cap limit to prevent massive payload sizes
        limit = min(limit, 100)

        quotations, total_count = HistoryService.get_history(
            db=db, search_query=q, limit=limit, offset=offset
        )

        items = []
        for q_rec in quotations:
            items.append(
                HistoryItemSchema(
                    quotation_id=q_rec.id,
                    customer_name=q_rec.customer_name,
                    phone=q_rec.phone,
                    feet=q_rec.feet,
                    mode=q_rec.mode,
                    grand_total=q_rec.grand_total,
                    status=q_rec.status,
                    created_at=q_rec.created_at,
                    last_opened_at=q_rec.last_opened_at,
                    pdf_path=q_rec.pdf_path,
                )
            )

        return HistoryListResponse(
            items=items, total=total_count, limit=limit, offset=offset
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve quotation logs: {str(e)}",
        )


@router.get("/{quotation_id}", status_code=status.HTTP_200_OK)
def get_quotation_by_id(quotation_id: str, db: Session = Depends(get_db)):
    """
    Fetches the complete stored JSON payload of a single estimate.
    Automatically increments and stores the last_opened_at timestamp.
    """
    quotation = HistoryService.get_quotation_by_id(db=db, quotation_id=quotation_id)
    if not quotation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quotation not found or has been soft-deleted.",
        )

    # Return the full stored quotation JSON structure
    return quotation.quotation_json


@router.post("/invoice", status_code=status.HTTP_201_CREATED)
def save_invoice_history(invoice_data: dict, db: Session = Depends(get_db)):
    """
    Saves a virtual invoice to the persistent database history.
    """
    try:
        q_data = {
            "quotation_id": invoice_data.get("invoice_id", str(uuid.uuid4())),
            "customer_name": invoice_data.get("customer_name", "Valued Customer"),
            "phone": invoice_data.get("phone", ""),
            "feet": 0,
            "mode": "GST_INVOICE" if invoice_data.get("is_gst") else "RETAIL_INVOICE",
            "totals": {"grand_total": invoice_data.get("grand_total", 0.0)},
            "doc_type": "INVOICE",
            **invoice_data,
        }
        quotation = HistoryService.save_quotation(db=db, q_data=q_data)
        return {"status": "success", "id": quotation.id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record invoice history: {str(e)}",
        )


@router.delete("/{quotation_id}", status_code=status.HTTP_200_OK)
def soft_delete_quotation(quotation_id: str, db: Session = Depends(get_db)):
    """
    Performs soft-deletion of an estimate by marking status as DELETED.
    Complies with retail audit-trail requirements by keeping backing SQL records intact.
    """
    success = HistoryService.soft_delete_quotation(db=db, quotation_id=quotation_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quotation record not found."
        )
    return {"status": "success", "message": "Quotation successfully soft-deleted."}

