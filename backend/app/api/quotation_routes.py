import uuid
import io
import os
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.responses import StreamingResponse
from weasyprint import HTML
from sqlalchemy.orm import Session
from backend.app.database.db import get_db

from backend.app.schemas.quotation import (
    QuotationRequest,
    QuotationResponse,
    SummaryMetadata,
)
from backend.app.schemas.pdf import PDFGenerateRequest
from backend.app.services.calculation_service import CalculationService
from backend.app.services.recommender import RecommendationService
from backend.app.services.pdf_service import PDFService
from backend.app.core.config_loader import settings

router = APIRouter(prefix="/quotation", tags=["Quotation Generation Engine"])


@router.post(
    "/generate", response_model=QuotationResponse, status_code=status.HTTP_200_OK
)
async def generate_quotation(request: QuotationRequest, db: Session = Depends(get_db)):
    """
    Orchestrates quotation generation:
    1. Validates inputs and normalizes case structures.
    2. Executes modular calculation and recommendation engines.
    3. Resolves starters dynamically scaling by primary motor HP.
    4. Employs dynamic branding mappings (e.g. Cable WIRE) to preserve retail trust.
    5. Returns fully mapped, frontend-ready JSON estimates.
    """
    try:
        # 1. Pipe Selection
        pipe_detail = CalculationService.select_pipe(request.feet, request.mode)

        # 2. Cable Selection
        cable_detail = CalculationService.select_cable(request.feet, request.mode)

        # 3. Motor Recommendations
        motors = RecommendationService.recommend_motors(
            feet=request.feet,
            phase=request.phase.value,
            preferred_brand=request.preferred_brand,
            mode=request.mode,
        )

        if not motors:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No submersible motor matches found for depth {request.feet} FT and phase {request.phase.value}.",
            )

        # Find primary motor recommendation to scale single-phase starter sizing
        primary_motor = next(
            (m for m in motors if m.is_primary_recommendation), motors[0]
        )

        # 4. Starter Panel Selection (scaled dynamically by motor HP)
        starter_detail = CalculationService.select_starter(
            phase=request.phase.value,
            starter_type=request.starter_type,
            motor_hp=primary_motor.hp,
        )

        # 5. Accessories and Fittings Charges
        accessories_detail = CalculationService.get_accessories()
        fitting_detail = CalculationService.select_fitting_charges(request.feet)

        # 6. Sum subtotal and calculate totals
        subtotal = round(
            pipe_detail.total_cost
            + cable_detail.total_cost
            + primary_motor.price
            + starter_detail.price
            + accessories_detail.price
            + fitting_detail.price,
            2,
        )

        totals_detail = CalculationService.calculate_totals(subtotal)

        # 7. Dynamic UI Summary & PDF metadata
        ui_labels = settings.get("ui/labels", {})

        mode_label = ui_labels.get("modes", {}).get(
            f"{request.mode.value}_label", request.mode.value
        )
        mode_desc = ui_labels.get("modes", {}).get(f"{request.mode.value}_desc", "")

        summary_metadata = SummaryMetadata(
            mode_label=mode_label,
            mode_description=mode_desc,
            cable_match_summary=f"{cable_detail.brand.display_brand} ({cable_detail.spec}) - {cable_detail.length_meters} meters",
            pipe_match_summary=f"{pipe_detail.brand.display_brand} ({pipe_detail.type}) - {pipe_detail.length_meters} meters",
            motor_match_summary=f"{primary_motor.brand} {primary_motor.spec} (Rs. {primary_motor.price:,.2f})",
            formatted_subtotal=f"Rs. {totals_detail.subtotal:,.2f}",
            formatted_discount=f"Rs. {totals_detail.discount_amount:,.2f} ({totals_detail.discount_percentage}%)",
            formatted_grand_total=f"Rs. {totals_detail.grand_total:,.2f}",
        )

        # 8. Compile full response with UUID and timestamp
        response_data = QuotationResponse(
            quotation_id=uuid.uuid4(),
            generated_at=datetime.utcnow().isoformat() + "Z",
            customer_name=request.customer_name,
            phone=request.phone,
            feet=request.feet,
            mode=request.mode,
            pipe=pipe_detail,
            cable=cable_detail,
            starter=starter_detail,
            accessories=accessories_detail,
            fitting=fitting_detail,
            motors=motors,
            totals=totals_detail,
            summary=summary_metadata,
        )

        # 9. Auto-save to SQLite persistence database
        try:
            from backend.app.services.history_service import HistoryService

            HistoryService.save_quotation(db=db, q_data=response_data.dict())
        except Exception as db_err:
            print(f"Warning: SQLite auto-save pipeline failure: {db_err}")

        return response_data

    except HTTPException as he:
        raise he
    except Exception as e:
        # Fallback to internal error handler
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal calculation failure: {str(e)}",
        )


@router.post("/pdf/generate")
async def generate_pdf(request: PDFGenerateRequest):
    """
    Receives sanitized quotation HTML from frontend and delegates PDF
    compilation to the PDFService.
    """
    try:
        pdf_bytes = PDFService.generate_quotation_pdf(request)

        # Stream binary as downloadable attachment
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={request.filename}"
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF Compilation Engine failure: {str(e)}",
        )
