import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.db import Base
from app.database.settings_model import ShopSettings


class Customer(Base):
    """
    Customer table: Stores unique customer records.
    Maintains clean normalized phone numbers for reliable operational search lookup.
    """

    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False, index=True)
    phone = Column(String, nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    # Relationships
    quotations = relationship(
        "Quotation", back_populates="customer", cascade="all, delete-orphan"
    )


class Quotation(Base):
    """
    Quotation table: Stores detailed digital estimates.
    Preserves fast snapshot fields separate from the complete structured quotation JSON
    for extremely lightweight queries and indexing speed.
    """

    __tablename__ = "quotations"

    id = Column(String, primary_key=True, index=True)  # Stores UUID4 strings
    customer_id = Column(
        Integer, ForeignKey("customers.id"), nullable=False, index=True
    )

    # Redundant snapshot fields for ultra-fast, index-friendly operational querying
    customer_name = Column(String, nullable=False)
    phone = Column(String, nullable=False, index=True)
    feet = Column(Integer, nullable=False, index=True)
    grand_total = Column(Float, nullable=False, index=True)
    mode = Column(String, nullable=False)

    # Soft deletion & workflow tracking
    status = Column(String, default="ACTIVE", index=True)  # ACTIVE, ARCHIVED, DELETED
    quotation_version = Column(
        Integer, default=1, nullable=False
    )  # Schema migration safeguard
    last_opened_at = Column(DateTime, nullable=True)  # Workflow timestamp tracking
    pdf_path = Column(
        String, nullable=True
    )  # Nullable path for future export integrations

    # Full pricing and recommended configuration payload
    quotation_json = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    # Relationships
    customer = relationship("Customer", back_populates="quotations")
