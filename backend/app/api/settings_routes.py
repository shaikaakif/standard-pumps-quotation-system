from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from .app.database.db import get_db
from .app.database.settings_model import ShopSettings

settings_router = APIRouter()

DEFAULT_SETTINGS = {
    "business": {
        "shop_name": "Standard Pumps & Borewell",
        "tagline": "Dealers in Submersible Motors, Pipes, Cables & Fittings",
        "phone": "+91 9110704747 , +91 9581472786",
        "whatsapp": "+91 9110704747",
        "address": "PILLAR NO 101, ATTAPUR, RINGROAD, HYDERABAD, TELANGANA 500048",
        "email": "",
        "gst_number": "",
        "website": "",
        "owner_name": "SHAIK ASIF"
    },
    "quotation": {
        "footer_notes": [
            "Motor warranty is subject to manufacturer terms and conditions.",
            "Calculations are based on dynamic price parameters and standard depth thresholds.",
            "Installation charges include standard manual or machine lifting labor.",
            "Accessories include high-strength bore caps, clamps, and connections."
        ],
        "warranty_text": "Motor warranty is subject to manufacturer terms and conditions.",
        "installation_notes": "Installation charges include standard manual or machine lifting labor.",
        "thank_you_message": "Thank you for choosing Standard Pumps and Borewell.",
        "disclaimer": "This is an estimate only. Actual prices may vary.",
        "signature_label": "Authorized Signature"
    },
    "defaults": {
        "mode": "REGULAR",
        "discount_percentage": 2.5,
        "starter_type": "manual"
    }
}

@settings_router.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    """
    Fetch the shop settings. If none exist in the database, return defaults.
    """
    settings_record = db.query(ShopSettings).filter(ShopSettings.id == 1).first()
    if settings_record and settings_record.settings_json:
        return settings_record.settings_json
    return DEFAULT_SETTINGS

@settings_router.put("/settings")
def update_settings(settings: dict = Body(...), db: Session = Depends(get_db)):
    """
    Update or create the shop settings.
    """
    settings_record = db.query(ShopSettings).filter(ShopSettings.id == 1).first()
    if settings_record:
        settings_record.settings_json = settings
    else:
        settings_record = ShopSettings(id=1, settings_json=settings)
        db.add(settings_record)
    
    db.commit()
    db.refresh(settings_record)
    return settings_record.settings_json
