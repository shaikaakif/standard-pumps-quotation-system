import os
import io
from weasyprint import HTML
from backend.app.schemas.pdf import PDFGenerateRequest

class PDFService:
    """
    Handles PDF compilation and generation logic.
    Injects custom styles and tailwind base for WeasyPrint HTML-to-PDF rendering.
    """

    @staticmethod
    def generate_quotation_pdf(request: PDFGenerateRequest) -> bytes:
        """
        Receives sanitized quotation HTML, wraps it in full A4 print-ready layouts,
        injects Tailwind and print styles, and compiles to PDF bytes.
        """
        # Load local CSS files to inject
        current_dir = os.path.dirname(os.path.abspath(__file__))
        css_path = os.path.abspath(
            os.path.join(
                current_dir,
                "..",
                "..",
                "..",
                "frontend",
                "src",
                "styles",
                "quotation.css",
            )
        )

        custom_css = ""
        if os.path.exists(css_path):
            try:
                with open(css_path, "r", encoding="utf-8") as f:
                    custom_css = f.read()
            except Exception as e:
                print(f"Warning: Failed to load local quotation.css: {e}")

        # Construct A4 HTML with pre-compiled Tailwind CDN reference
        full_html = f"""
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>{request.filename}</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
            
            <!-- Load precompiled Tailwind stylesheet for offline WeasyPrint fetches -->
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
            
            <style>
              {custom_css}
              
              /* WeasyPrint-specific page overrides */
              @page {{
                size: A4 portrait;
                margin: 15mm;
              }}
              
              body {{
                font-family: 'Inter', 'Poppins', sans-serif !important;
                background-color: #ffffff !important;
                color: #0f172a !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }}
              
              /* Custom brand colors to override standard tailwind v2 styles */
              .bg-brand-navy-900 {{ background-color: #102a43 !important; }}
              .bg-brand-navy-800 {{ background-color: #1e3a8a !important; }}
              .text-brand-navy-800 {{ color: #1e3a8a !important; }}
              .bg-brand-navy-50 {{ background-color: #f0f4f8 !important; }}
              .border-brand-gray-200 {{ border-color: #e2e8f0 !important; }}
              .bg-brand-gray-50 {{ background-color: #f1f5f9 !important; }}
              .text-brand-yellow {{ color: #fbbf24 !important; }}
              .bg-brand-yellow {{ background-color: #fbbf24 !important; }}
              .text-brand-green {{ color: #25d366 !important; }}
              .text-brand-gray-550 {{ color: #64748b !important; }}
              .text-brand-gray-400 {{ color: #94a3b8 !important; }}
              
              .quotation-container {{
                max-width: 100% !important;
                width: 100% !important;
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
              }}
              
              /* Print-specific element hides */
              .no-print, button, header, footer, nav, [class*="toast"], [class*="overlay"], [class*="modal"] {{
                display: none !important;
              }}
            </style>
          </head>
          <body>
            <div class="quotation-container">
              {request.html_content}
            </div>
          </body>
        </html>
        """

        # Compile PDF binary using WeasyPrint
        pdf_bytes = HTML(string=full_html).write_pdf()
        return pdf_bytes
