# BOREWELL QUOTATION & BILLING OS — MASTER CONTEXT & ARCHITECTURE GUIDE

> **Product Name:** Borewell Quotation & Billing Automation System (White-Label Commercial Edition)  
> **Target Audience:** Borewell Drilling Contractors, Submersible Pump Dealers, Electrical & Hardware Retailers  
> **Business Model:** White-Label Software / High-Ticket Agency Setup (₹12,000 – ₹15,000 per shop + Annual Recurring Maintenance)

---

## 1. Executive Summary & Why This Product Wins

In India and agricultural markets, **95% of borewell hardware shops write quotations and retail bills on carbon-copy paper by hand**.

### The Problem in Every Borewell Shop:
1. **Calculation Takes 15–20 Minutes:** Calculating total pipe bundles, extra cable slack (meters = feet / 3.28 + 10m), motor stage head curves, and starter compatibility while a farmer or customer is standing at the counter causes long queues.
2. **Expensive Miscalculation Errors:** A shopkeeper misjudging cable thickness or pipe weight can lose ₹1,500 – ₹2,500 on a single deep borewell quotation.
3. **No Professional Impression:** Hand-scribbled slips make customers feel the pricing is arbitrary, leading to aggressive bargaining.
4. **Lost Quotations:** Paper slips are lost; when a farmer returns 2 weeks later after drilling the hole, the shopkeeper has no record of what was quoted.

### The Solution (This System):
* **Instant Calculation (10 Seconds):** Shopkeeper enters borewell depth in feet (e.g., `450`), and the system automatically outputs the exact motor recommendation, pipe rating (10kg/12.5kg/16kg), cable spec (2.5 sqmm/4 sqmm), starter panel, accessories, and labor charges.
* **1-Click WhatsApp Delivery:** With one tap, a high-resolution, print-ready branded PDF is sent directly from the shopkeeper's WhatsApp number to the customer's phone with a personalized Arabic/English or regional greeting.
* **1-Page Retail & Tax Invoicing:** Switch between Quotation Estimate and Virtual GST/Cash Invoice in 1 second.
* **100% Offline-First PWA:** Works without internet in rural agricultural zones and installs like a native Android/iOS application.

---

## 2. Complete Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CLIENT (PWA)                           │
│  React 18  │  Vite 5  │  Tailwind CSS 3  │  Framer Motion  │  Workbox  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  CALC ENGINE │             │  PDF ENGINE  │             │  WHATSAPP GW │
│ (Serverless) │             │(html2canvas+ │             │  (UltraMsg   │
│ Client-side  │             │   jspdf)     │             │  Cloud API)  │
└──────┬───────┘             └──────┬───────┘             └──────┬───────┘
       │                            │                            │
       └────────────────────────────┼────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA PERSISTENCE & SYNC                         │
│  LocalStorage (Offline Primary)  ◄──►  Supabase PostgreSQL (Cloud Sync)│
└────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technologies Used | Role & Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18 + Vite 5** | High-performance Single-Page Application (SPA) with zero render lag and instant page transitions. |
| **Styling & UI** | **Tailwind CSS 3 + Lucide / React Icons** | Utility-first responsive design; strictly mobile-first with desktop expansion. Professional hardware-store aesthetic (Navy, Slate, Amber, Emerald). |
| **PWA & Offline** | **vite-plugin-pwa + Workbox 7** | Service worker precaching. Allows installation on home screen (APK/PWA style) and runs offline without internet connectivity. |
| **Calculation Engine** | **Client-side JavaScript (`quotationService.js`)** | 100% Serverless formulas for depth conversion, pump curve selection, cable resistance brackets, and labor charges. |
| **PDF Generation** | **`html2canvas` + `jspdf`** | Generates pixel-perfect, deterministic vector A4 PDF quotations and 1-page retail invoices directly in the user's browser. |
| **WhatsApp Automation** | **UltraMsg REST API** | Cloud QR-gateway that links to the shopkeeper's actual WhatsApp account. Sends PDFs with customized captions directly without needing costly Meta Business Cloud approvals. |
| **Database & Cloud Sync** | **Supabase (PostgreSQL) + LocalStorage** | Dual-tier storage. Quotations and customer CRM records save to browser LocalStorage instantly, and asynchronously mirror to Supabase Cloud when internet is available. |
| **Deployment** | **Vercel CDN Edge Network** | Globally distributed edge hosting with continuous deployment from GitHub `main`. 0 backend server cost. |

---

## 3. Mathematical Formulas & Business Logic

### A. Feet to Meters Conversion
$$\text{meters} = \frac{\text{depth in feet}}{3.28}$$
*Example: $450\text{ ft} \div 3.28 = 137.19\text{ m}$.*

### B. Cable Safety Slack Formula
$$\text{cable length} = \text{meters} + 10\text{ meters extra}$$
*Reason: 10m provides necessary slack from borehead to starter panel and pump wiring.*

### C. Pipe Rating Classification
* **0 – 200 FT:** 10 KG / 1.0" or 1.25" PVC / Column Pipe (Budget)
* **200 – 450 FT:** 12.5 KG PVC / Column Pipe (Preferred Industry Standard)
* **450 – 1000+ FT:** 16 KG High-Pressure Column Pipe (Heavy Duty)

### D. Cable Thickness (Voltage Drop Protection)
* **0 – 150 FT:** 1.5 SQMM 3-Core Flat Submersible Cable
* **150 – 350 FT:** 2.5 SQMM 3-Core Flat Submersible Cable
* **350 – 650+ FT:** 4.0 SQMM Heavy Duty 3-Core Submersible Cable (Prevents motor winding burnouts due to voltage drop over long vertical distances)

### E. Starter Panel Logic
* **Single Phase (1.0 HP – 3.0 HP):**
  * Manual Starter (Capacitor run, voltmeter, ammeter)
  * Automatic Starter (Sunshine Auto Cut-off panel for dry-run protection)
* **Three Phase (3.0 HP – 10.0 HP):**
  * 3-Phase Standard Timer Starter Panel

### F. Installation & Labour Charges
* **0 – 500 FT:** ₹1,500 (Manual labor fitting)
* **500 – 700 FT:** ₹2,000 (Deep manual crew labor)
* **700+ FT:** ₹3,000 (Lifting machine / tractor tripod installation)

---

## 4. White-Label Multi-Shop Configuration

To sell this system to other borewell shops, the application is designed to be 100% white-label. No shop-specific names, phone numbers, or rates should be hardcoded.

### Configurable Shop Profile (In Settings):
* **Shop Name:** e.g., *"Sri Laxmi Borewells & Motors"*
* **Tagline:** e.g., *"Dealers in Texmo, CRI, Kirloskar Submersible Pumps"*
* **Primary Phone:** Shop counter mobile number
* **Secondary Phone / Landline:** Alternative contact
* **WhatsApp Number:** Dedicated number for automated quotes
* **Shop Address & Landmark:** Full address printed on bill footer
* **Owner / Signatory Name:** e.g., *"Ramesh Kumar"* (appears on calligraphic signature block)
* **Shop Logo:** Transparent PNG uploaded directly via Settings (renders on PDF header and app icon)

### Configurable Quotation Pricing Rates:
* Pipe price per meter (10kg, 12.5kg, 16kg)
* Cable price per meter (1.5 sqmm, 2.5 sqmm, 4.0 sqmm)
* Motor models and price list
* Starter panel prices
* Default discount percentage (e.g., 2.5%)

---

## 5. WhatsApp Gateway Setup (How it Works for Other Shops)

### The Core Concept:
Every borewell shop owner wants quotations sent from **their own WhatsApp phone number**, so their customers can reply directly to them.

### How UltraMsg Cloud Works:
1. UltraMsg is an HTTP API gateway that wraps WhatsApp Web in a cloud browser.
2. Each shop is assigned an **Instance ID** and **Token**.
3. When the shopkeeper scans a QR code using WhatsApp on their phone, that instance is linked to their phone number.

### Step-by-Step Onboarding Workflow for a New Client:
```
1. You register an instance for the client on UltraMsg (cost: ~$4/month or bundled in your fee).
2. Open the app on the client's laptop or mobile phone.
3. Go to System Settings -> WhatsApp Gateway.
4. Enter Instance ID and Token.
5. The screen displays a WhatsApp QR code.
6. Tell the shopkeeper:
   "Sir, open WhatsApp on your phone -> Three dots (⋮) -> Linked Devices -> Link a Device -> Scan this QR code."
7. In 5 seconds, the status changes to "AUTHENTICATED: Connected as [Shopkeeper's Name]".
8. Done! The gateway is now permanently connected to the shopkeeper's phone.
```

---

## 6. Business, Sales & Monetization Strategy (Charging ₹15,000)

### Can You Charge ₹15,000?
**Yes, absolutely.** In fact, ₹15,000 is an extremely attractive price point for a borewell hardware shop owner.

#### The Financial Justification for the Shopkeeper:
* A single borewell pump installation bill ranges from **₹40,000 to ₹1,50,000**.
* A shop owner sells **30 to 100 borewell packages a month**.
* If your software saves them from **one single pipe/cable under-calculation mistake per month**, they save ₹2,000.
* If your professional PDF quote converts just **one extra skeptical customer per month** because it looks like a corporate company bill, they earn an extra ₹8,000–₹12,000 profit.
* Over 1 year, this software makes/saves the shopkeeper **₹50,000 to ₹1,00,000+**. Charging ₹15,000 one-time is less than 20% of the value delivered!

### Recommended Pricing Model:

| Plan Component | Price | What's Included |
| :--- | :--- | :--- |
| **One-Time Onboarding & Setup** | **₹12,000 – ₹15,000** | • Full system deployment with their shop name & logo.<br>• Inputting their custom pipe/motor price list.<br>• Installing the PWA app on the owner's and staff's mobile phones and desktop PC.<br>• WhatsApp Gateway linking with their phone number.<br>• 1 hour of training for the shop owner and counter boys. |
| **Annual Maintenance & Gateway Fee** | **₹2,500 – ₹3,500 / year** | • UltraMsg WhatsApp gateway subscription renewal.<br>• Cloud database sync & automatic backup.<br>• Software updates and price revisions. |

### The 10-Minute Sales Pitch to Borewell Shop Owners:
> *"Uncle/Bhaiya, when a farmer or builder comes to your shop, how long does it take to write a quotation on a bill book? 15 minutes. And after you write it, the customer bargains because it’s handwritten on paper.*  
>  
> *Look at this: Just type '450 feet' into this app. In 3 seconds, it calculates the exact motor, Sudhakar pipes, Finolex cables, starter, and labor charges with your shop's logo on top. Tap one button, and a company-grade PDF is sent directly from your WhatsApp number to the customer's phone.*  
>  
> *You don't need any computer operator. You or your boy can do it from your mobile phone in 10 seconds. It works even when there is no internet in the shop."*

---

## 7. Directory Structure Reference

```
standard-pumps-quotation-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── forms/          # CustomerForm (Depth in feet, mode, phase)
│   │   │   ├── invoice/        # InvoiceForm & InvoiceDocument (1-page retail bill)
│   │   │   ├── quotation/      # QuotationHeader, PricingTable, RecommendationCard
│   │   │   ├── settings/       # BusinessInfoForm, UltraMsgGatewayForm, LogoUploader
│   │   │   └── system/         # PWA Install prompt, LoadingOverlay, ErrorBoundary
│   │   ├── services/
│   │   │   ├── quotationService.js   # 100% Serverless calculation engine
│   │   │   ├── pdfService.js         # Client-side html2canvas & jspdf exporter
│   │   │   ├── ultraMsgService.js    # UltraMsg automated WhatsApp gateway
│   │   │   ├── shareService.js       # Web Share API & WhatsApp captions
│   │   │   └── supabaseClient.js     # Cloud PostgreSQL sync service
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Main workspace (Quotation vs Invoice tabs)
│   │   │   ├── Preview.jsx           # Document preview, PDF download & share
│   │   │   ├── Customers.jsx         # Customer database & repeat quotation CRM
│   │   │   ├── History.jsx           # Past quotations & invoice history
│   │   │   └── Settings.jsx          # White-label profile & WhatsApp setup
│   │   └── hooks/
│   │       ├── useSettings.js        # Dynamic shop branding & rates state
│   │       └── useInstallPrompt.js   # PWA native install handler
│   └── package.json
└── docs/
    ├── context.md                    # This master document
    ├── PROJECT_CONTEXT.md            # Legacy project notes
    ├── calculation-flow.md           # Engineering calculation formulas
    └── deployment-guide.md           # Vercel & PWA deployment instructions
```
