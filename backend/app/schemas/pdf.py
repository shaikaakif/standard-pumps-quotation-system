from pydantic import BaseModel, Field

class PDFGenerateRequest(BaseModel):
    # Enforce a strict 2MB length limit on incoming HTML payloads
    # This prevents malicious payloads from crashing the WeasyPrint memory engine.
    html_content: str = Field(
        ..., 
        max_length=2_000_000,
        description="Sanitized and serialized quotation HTML content"
    )
    filename: str = Field(..., max_length=255, description="Target PDF file name for download")
