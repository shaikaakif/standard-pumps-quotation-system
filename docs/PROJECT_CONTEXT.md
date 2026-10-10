# PROJECT CONTEXT — BOREWELL QUOTATION & INVOICE AUTOMATION SYSTEM
*(White-Label Multi-Shop SaaS & Agency Architecture)*

## 1. Project Overview
A 100% Serverless, offline-capable Progressive Web Application (PWA) designed to automate borewell pump quotations, retail billing (GST & Non-GST cash receipts), and customer CRM for borewell contractors and hardware dealers.

Replaces error-prone handwritten bill books with instant, automated calculations and 1-tap WhatsApp PDF delivery.

---

## 2. Technology Stack

### Frontend & App Framework:
- **Core:** React 18, Vite 5, JavaScript (ES2022)
- **Styling:** Tailwind CSS 3 (Utility-first, strictly mobile-first with desktop adaptive layout)
- **Icons:** React Icons (`react-icons/fi`, `react-icons/fa`)
- **Animations & Effects:** Framer Motion, Canvas Confetti

### PWA & Offline Engine:
- **Library:** `vite-plugin-pwa` + Workbox 7
- **Caching:** Cache-first service worker precaching all application bundles and icons
- **Installability:** Add-to-homescreen prompt on Android, iOS Safari, and Windows Chrome/Edge

### Calculation Engine (100% Serverless):
- **Location:** `frontend/src/services/quotationService.js`
- **Execution:** 100% client-side in the browser (zero server round-trips, works completely offline)
- **Logic:** Depth-in-feet to motor HP and stage curves, pipe pressure ratings (10kg, 12.5kg, 16kg), cable thickness (1.5, 2.5, 4.0 sqmm), starter panel classification, accessories, and labor charges.

### PDF Rendering Engine:
- **Libraries:** `html2canvas` + `jspdf`
- **Location:** `frontend/src/services/pdfService.js`
- **Features:** Clean vector A4 pagination, deterministic UTC dates, print-safe margins, signature blocks, and watermarking.

### WhatsApp Cloud Automation Gateway:
- **Provider:** UltraMsg Cloud API (Multi-Instance QR Gateway)
- **Location:** `frontend/src/services/ultraMsgService.js`
- **Mechanism:** Links to the shopkeeper's physical WhatsApp account via QR scan. Sends document PDFs and structured text captions directly to the customer's phone number without requiring Meta Cloud API verification.

### Database & Storage:
- **Local:** Browser LocalStorage (instant offline cache for recent quotations, invoices, customers, and shop settings)
- **Cloud Sync:** Supabase PostgreSQL (`frontend/src/services/supabaseClient.js`) for centralized multi-device backup and reporting.

### Hosting & CI/CD:
- **Platform:** Vercel Serverless Edge Network
- **Deployment:** Continuous auto-deployment on push to GitHub `main` branch.

---

## 3. White-Label & Multi-Shop Customization
The system can be configured for any borewell or motor hardware shop without touching application source code:
1. **Shop Branding:** Shop Name, Tagline, Phone, Secondary Phone, WhatsApp Number, Address, and Owner Name configured in Settings.
2. **Logos & Seals:** Transparent PNG logo uploaded directly in Settings and applied to PDF bills, app header, and watermarks.
3. **Quotation Pricing Rates:** Configurable pipe price/meter, cable price/meter, motor catalogue, and starter rates.
4. **WhatsApp Gateway:** Each shop links their own phone number by entering their UltraMsg Instance ID & Token and scanning the on-screen QR code once.

---

## 4. Monetization & Business Model
- **Setup Fee:** ₹12,000 – ₹15,000 per shop (includes custom branding, price list entry, mobile/desktop PWA setup, WhatsApp linking, and owner training).
- **Annual Maintenance:** ₹2,500 – ₹3,500 per year (covers cloud backup and WhatsApp gateway renewal).
