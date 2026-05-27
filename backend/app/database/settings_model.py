import datetime
from sqlalchemy import Column, Integer, JSON, DateTime
from .app.database.db import Base

class ShopSettings(Base):
    """
    Settings table: Stores global configuration for the system.
    Only one row (id=1) should ever exist.
    """
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, default=1)
    settings_json = Column(JSON, nullable=False)
    settings_version = Column(Integer, default=1, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
