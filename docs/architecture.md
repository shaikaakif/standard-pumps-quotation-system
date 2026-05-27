# FILE: docs/architecture.md

```md
# SYSTEM ARCHITECTURE

## High Level Architecture

Frontend (React PWA)
↓
FastAPI Backend
↓
Business Logic Services
↓
Config System
↓
Database + PDF Engine

---

# FRONTEND RESPONSIBILITIES

- customer form
- quotation preview
- PDF preview
- Web Share API
- PWA support
- responsive UI
- animations
- quotation history display

---

# BACKEND RESPONSIBILITIES

- calculation engine
- pricing logic
- motor recommendation
- API responses
- PDF generation
- data storage
- quotation history

---

# CONFIG RESPONSIBILITIES

Config folder stores:
- pricing
- business rules
- ranges
- labels
- UI settings
- recommendation logic

No pricing should be hardcoded in frontend.

---

# CORE SYSTEM MODULES

## 1. Calculation Engine

Handles:
- feet to meter conversion
- cable length calculation
- totals
- discounts

---

## 2. Recommendation Engine

Selects:
- premium motor
- mid range motor
- budget motor

Based on:
- bore feet
- ranges
- business rules

---

## 3. PDF Engine

Converts quotation preview into downloadable PDF.

---

## 4. Share Engine

Uses:
- Web Share API
- WhatsApp share URLs

---

# PROJECT STRUCTURE

frontend/
backend/
config/

---

# API FLOW

Frontend Form
↓
POST /quotation/generate
↓
Backend calculation
↓
JSON response
↓
Quotation preview rendering

---

# DATABASE TABLES

## quotations

Stores:
- customer name
- phone number
- bore feet
- totals
- generated quotation JSON
- created date

---

# FUTURE SCALABILITY

Possible future additions:
- GST billing
- stock management
- technician assignment
- inventory tracking
- multi-shop SaaS
- analytics dashboard
```

---