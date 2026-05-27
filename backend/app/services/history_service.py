import datetime
import re
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.database.models import Customer, Quotation


class HistoryService:
    """
    HistoryService: Controls database operations for quotation persistence,
    strict phone normalization, pagination calculations, and soft-delete features.
    """

    @staticmethod
    def normalize_phone(phone_str: str) -> str:
        """
        Strictly normalizes input phone numbers by removing:
        - spaces, tabs
        - country prefixes (e.g. +91, 91)
        - brackets, dashes, hyphens
        Returns a clean 10-digit numeric string.
        """
        if not phone_str:
            return ""

        # Remove country prefix code +91 or leading 91
        cleaned = phone_str.strip()
        cleaned = re.sub(r"^\+?91", "", cleaned)

        # Strip all non-digit characters
        digits = "".join([c for c in cleaned if c.isdigit()])

        # Return exactly the last 10 digits for consistent lookup
        return digits[-10:] if len(digits) >= 10 else digits

    @classmethod
    def save_quotation(cls, db: Session, q_data: dict) -> Quotation:
        """
        Saves a successful quotation response to SQLite.
        Includes a transactional get-or-create lookup for Customer records
        and serializes full estimate payloads alongside fast-query snapshots.
        """
        # 1. Normalize Customer Phone
        raw_phone = q_data.get("phone", "")
        clean_phone = cls.normalize_phone(raw_phone)
        customer_name = q_data.get("customer_name", "Valued Customer")

        # 2. Get-or-create Customer record (transaction safe)
        customer = db.query(Customer).filter_by(phone=clean_phone).first()
        if not customer:
            customer = Customer(name=customer_name, phone=clean_phone)
            db.add(customer)
            db.flush()  # Secure customer.id without committing yet
        else:
            # Proactively update name if there was a minor spelling correction
            customer.name = customer_name

        # 3. Create Quotation record using snapshot structures
        grand_total = q_data.get("totals", {}).get("grand_total", 0.0)

        # If grand_total is nested or passed as a formatted string in other contexts, fall back safely
        if isinstance(grand_total, str):
            try:
                grand_total = float(re.sub(r"[^\d.]", "", grand_total))
            except Exception:
                grand_total = 0.0

        quotation = Quotation(
            id=str(q_data["quotation_id"]),
            customer_id=customer.id,
            customer_name=customer_name,
            phone=clean_phone,
            feet=int(q_data["feet"]),
            grand_total=float(grand_total),
            mode=q_data["mode"],
            status="ACTIVE",
            quotation_version=1,
            last_opened_at=datetime.datetime.utcnow(),
            quotation_json=q_data,
        )

        db.add(quotation)
        db.commit()
        db.refresh(quotation)
        return quotation

    @classmethod
    def get_history(
        cls,
        db: Session,
        search_query: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[Quotation], int]:
        """
        Fetches historical quotation listings excluding soft-deleted records.
        Supports quick case-insensitive name/phone search and provides pagination meta metrics.
        """
        # Query only non-deleted quotations
        query = db.query(Quotation).filter(Quotation.status != "DELETED")

        # Apply substring matches if search query is active
        if search_query:
            clean_q = search_query.strip()
            # If search contains digits, match against normalized phone snapshot
            if any(char.isdigit() for char in clean_q):
                normalized_q = cls.normalize_phone(clean_q)
                query = query.filter(Quotation.phone.like(f"%{normalized_q}%"))
            else:
                query = query.filter(Quotation.customer_name.ilike(f"%{clean_q}%"))

        total_count = query.count()

        # Pull list sorted by descending timestamps to place most recent first
        quotations = (
            query.order_by(Quotation.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        return quotations, total_count

    @classmethod
    def get_quotation_by_id(cls, db: Session, quotation_id: str) -> Optional[Quotation]:
        """
        Fetches a single active estimate by ID and updates its last_opened_at timestamp.
        """
        quotation = (
            db.query(Quotation)
            .filter(Quotation.id == quotation_id, Quotation.status != "DELETED")
            .first()
        )
        if quotation:
            quotation.last_opened_at = datetime.datetime.utcnow()
            db.commit()
            db.refresh(quotation)
        return quotation

    @classmethod
    def soft_delete_quotation(cls, db: Session, quotation_id: str) -> bool:
        """
        Soft-deletes a quotation by updating status to DELETED.
        This preserves database historical logs and complies with soft-delete guidelines.
        """
        quotation = db.query(Quotation).filter(Quotation.id == quotation_id).first()
        if quotation:
            quotation.status = "DELETED"
            db.commit()
            return True
        return False
