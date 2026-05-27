import re
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any
from .app.schemas.enums import MaterialMode, StarterType, ElectricalPhase


class QuotationRequest(BaseModel):
    customer_name: str = Field(
        ..., min_length=2, max_length=100, description="Customer full name"
    )
    phone: str = Field(..., description="10-digit customer phone number")
    feet: int = Field(..., gt=0, lt=5000, description="Bore depth in feet")
    phase: ElectricalPhase = Field(
        ElectricalPhase.SINGLE, description="Electrical Phase ('single' or 'three')"
    )
    starter_type: StarterType = Field(
        StarterType.MANUAL, description="Starter type ('manual', 'auto', 'timer')"
    )
    preferred_brand: Optional[str] = Field(
        None,
        description="Preferred motor brand (e.g. 'Crompton', 'Aqua Texmo', 'CRI Pumps', 'budget')",
    )
    mode: MaterialMode = Field(
        MaterialMode.REGULAR, description="Quotation material mode"
    )

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"\D", "", v)
        if len(cleaned) != 10:
            raise ValueError("Phone number must contain exactly 10 digits.")
        return cleaned

    @field_validator("phase", mode="before")
    @classmethod
    def normalize_phase(cls, v: Any) -> str:
        if isinstance(v, str):
            s = v.upper().strip()
            if s in ["SINGLE", "SINGLE_PHASE", "1 PHASE", "1_PHASE", "SINGLE PHASE"]:
                return "single"
            if s in ["THREE", "THREE_PHASE", "3 PHASE", "3_PHASE", "THREE PHASE"]:
                return "three"
            return v.lower()
        return v

    @field_validator("starter_type", mode="before")
    @classmethod
    def normalize_starter(cls, v: Any) -> str:
        if isinstance(v, str):
            return v.lower().strip()
        return v

    @field_validator("mode", mode="before")
    @classmethod
    def normalize_mode(cls, v: Any) -> str:
        if isinstance(v, str):
            return v.upper().strip()
        return v


class BrandDetail(BaseModel):
    internal_brand: str = Field(
        ..., description="Actual internal database/config brand name"
    )
    display_brand: str = Field(
        ..., description="Customer-facing display brand name to protect shop trust"
    )


class PipeDetail(BaseModel):
    brand: BrandDetail
    type: str
    length_meters: float
    price_per_meter: float
    total_cost: float
    reasoning: Optional[str] = None


class CableDetail(BaseModel):
    brand: BrandDetail
    spec: str
    length_meters: float
    price_per_meter: float
    total_cost: float
    reasoning: Optional[str] = None


class StarterDetail(BaseModel):
    brand: str
    type: str
    price: float


class AccessoryDetail(BaseModel):
    name: str
    price: float


class FittingDetail(BaseModel):
    label: str
    price: float
    method: str


class MotorRecommendation(BaseModel):
    brand: str
    spec: str
    price: float
    hp: float
    stage: int
    is_premium: bool
    is_primary_recommendation: bool
    reasoning: str


class TotalsDetail(BaseModel):
    subtotal: float
    discount_percentage: float
    discount_amount: float
    grand_total: float


class SummaryMetadata(BaseModel):
    mode_label: str
    mode_description: str
    cable_match_summary: str
    pipe_match_summary: str
    motor_match_summary: str
    formatted_subtotal: str
    formatted_discount: str
    formatted_grand_total: str


class QuotationResponse(BaseModel):
    quotation_id: UUID
    generated_at: str
    customer_name: str
    phone: str
    feet: int
    mode: MaterialMode
    pipe: PipeDetail
    cable: CableDetail
    starter: StarterDetail
    accessories: AccessoryDetail
    fitting: FittingDetail
    motors: List[MotorRecommendation]
    totals: TotalsDetail
    summary: SummaryMetadata
