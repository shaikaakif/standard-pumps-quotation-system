# TASKS.md

# STANDARD PUMPS QUOTATION SYSTEM

# MASTER DEVELOPMENT ROADMAP

---

# PROJECT OVERVIEW

The Standard Pumps Quotation System is a professional full-stack quotation automation platform for borewell and submersible motor businesses.

The purpose of this system is to replace handwritten quotations with a modern digital quotation generation workflow.

The application should:

* generate quotations automatically
* calculate pipe/cable lengths
* recommend motors
* generate PDF quotations
* support Web Share API
* support WhatsApp sharing
* work as a PWA
* store quotation history
* provide professional UI/UX

This project is being developed using an AI-assisted engineering workflow.

## Backend Setup
- [x] Run backend linting & formatting check with `black` and `ruff`

## Frontend Setup
- [x] Configure `frontend/package.json` with React, Vite, TailwindCSS, PostCSS, Framer Motion, React Icons, Axios, React Router DOM, and Vite Plugin PWA
- [x] Write `frontend/vite.config.js`, `frontend/tailwind.config.js`, and `frontend/postcss.config.js`
- [x] Create `frontend/.env` with `VITE_API_URL`
- [x] Initialize base folders (`src/components`, `src/context`, `src/pages`, `src/utils`, `src/styles`)
- [x] Write `frontend/src/index.css` with Tailwind directives and font family (Inter/Poppins) config
- [x] Write `frontend/src/main.jsx` and a minimal `frontend/src/App.jsx`
- [x] Install dependencies and run build validation

---

# DEVELOPMENT PHILOSOPHY

IMPORTANT:

This project MUST NOT be developed:

* randomly
* by generating the whole app at once
* by rewriting architecture repeatedly
* by creating huge uncontrolled code dumps

This project MUST be developed:

* module-by-module
* file-by-file
* responsibility-by-responsibility
* phase-by-phase

Architecture consistency is CRITICAL.

---

# AI DEVELOPMENT RULES

The AI must STRICTLY follow these rules:

* Never rewrite unrelated files
* Never change architecture without reason
* Never hardcode pricing values
* Always use config-driven systems
* Always keep modules isolated
* Always keep code scalable
* Always maintain naming consistency
* Always follow existing folder structure
* Always ask before restructuring systems
* Always mention dependencies required
* Always mention assets needed from user side

---

# AI CONTEXT RULES

Before every coding task:
AI MUST read:

* PROJECT_CONTEXT.md
* architecture.md
* calculation-flow.md
* ui-guidelines.md
* API_CONTRACTS.md
* DECISIONS.md

These markdown files are the persistent memory system of the project.

---

# PROJECT ARCHITECTURE

Project Structure:

frontend/
backend/
config/
docs/
scripts/

---

# FRONTEND STACK

* React
* Vite
* TailwindCSS
* Framer Motion
* React Icons
* vite-plugin-pwa

---

# BACKEND STACK

* Python
* FastAPI
* SQLite
* SQLAlchemy
* Jinja2
* WeasyPrint

---

# DEPLOYMENT STACK

Frontend:

* Vercel

Backend:

* Railway

---

# CORE BUSINESS LOGIC

# Feet to Meter Conversion

meters = feet / 3.28

---

# Cable Length Rule

cable_length = meters + 10

The extra 10 meters are used for:

* flexibility
* installation slack
* fitting convenience

---

# CONFIG-DRIVEN ARCHITECTURE

ALL pricing and business logic must come from:
config/

NO pricing should ever be hardcoded inside frontend components.

Config must contain:

* motor pricing
* pipe pricing
* cable pricing
* starter pricing
* fitting pricing
* recommendation rules
* discount rules

---

# UI PHILOSOPHY

The UI should feel:

* premium
* professional
* business-oriented
* trustworthy
* clean
* mobile-first

The UI should NOT feel:

* futuristic
* gaming style
* cyberpunk
* overloaded
* flashy

Design inspiration:

* invoice systems
* fintech dashboards
* ERP quotation software
* hardware business workflow

---

# TARGET USERS

* borewell shop owners
* motor dealers
* technicians
* contractors
* farmers
* domestic customers

---

# CORE FEATURES

# Required Features

* quotation generation
* live quotation preview
* PDF generation
* Web Share API
* WhatsApp sharing
* PWA support
* quotation history
* recommendation engine
* responsive UI

---

# DEVELOPMENT PHASES

# PHASE 1

PROJECT INITIALIZATION

Goal:
Initialize:

* frontend
* backend
* git
* dependencies
* Tailwind
* FastAPI

Tasks:

* setup React
* setup Vite
* setup Tailwind
* setup FastAPI
* setup GitHub
* setup environment variables

Status:
PENDING

---

# PHASE 2

CONFIG SYSTEM

Goal:
Build config-driven architecture.

Tasks:

* create motors config
* create pipes config
* create cable config
* create starter config
* create business rules config

Requirements:

* scalable JSON structure
* no hardcoded logic
* dynamic ranges

Status:
PENDING

---

# PHASE 3

CALCULATION ENGINE

Goal:
Create backend business logic engine.

Tasks:

* feet conversion
* cable calculation
* pipe selection
* cable selection
* totals
* discount calculations

Requirements:

* modular functions
* clean services
* reusable architecture

Status:
PENDING

---

# PHASE 4

RECOMMENDATION ENGINE

Goal:
Create motor recommendation logic.

Tasks:

* premium recommendation
* mid-range recommendation
* budget recommendation

Requirements:

* config-driven logic
* scalable recommendation engine

Status:
PENDING

---

# PHASE 5

FASTAPI APIs

Goal:
Create backend API layer.

Tasks:

* quotation generation API
* health API
* quotation history API
* PDF generation API

Requirements:

* clean response structure
* proper validation
* Pydantic schemas

Status:
PENDING

---

# PHASE 6

FRONTEND FOUNDATION

Goal:
Initialize frontend architecture.

Tasks:

* routing
* global styles
* layouts
* state management
* context providers

Requirements:

* scalable React architecture
* responsive foundation

Status:
PENDING

---

# PHASE 7

CUSTOMER FORM SYSTEM

Goal:
Create quotation form workflow.

Tasks:

* customer form
* bore input
* phase selector
* brand selector
* starter selector

Requirements:

* responsive UI
* validation
* smooth UX

Status:
PENDING

---

# PHASE 8

QUOTATION PREVIEW UI

Goal:
Create professional quotation preview.

Tasks:

* quotation table
* totals section
* recommendation cards
* customer details
* branding section

Requirements:

* premium business aesthetic
* mobile responsive
* readable layout

Status:
PENDING

---

# PHASE 9

PDF ENGINE

Goal:
Generate professional downloadable PDFs.

Tasks:

* HTML to PDF
* preserve UI styling
* downloadable quotation

Requirements:

* high quality output
* production-ready formatting

Status:
PENDING

---

# PHASE 10

WEB SHARE API

Goal:
Enable quotation sharing.

Tasks:

* Web Share API
* WhatsApp sharing
* mobile compatibility

Requirements:

* graceful fallback support
* proper browser handling

Status:
PENDING

---

# PHASE 11

PWA SYSTEM

Goal:
Convert app into installable mobile application.

Tasks:

* manifest
* service worker
* offline support
* install button

Requirements:

* vite-plugin-pwa
* HTTPS support

Status:
PENDING

---

# PHASE 12

DATABASE SYSTEM

Goal:
Store quotations and customer history.

Tasks:

* quotation table
* customer table
* history storage

Requirements:

* scalable schema
* timestamps
* proper indexing

Status:
PENDING

---

# PHASE 13

DEPLOYMENT

Goal:
Deploy production-ready application.

Tasks:

* deploy frontend
* deploy backend
* setup domains
* configure environment variables

Platforms:

* Vercel
* Railway

Status:
PENDING

---

# IMPORTANT DEVELOPMENT RULES

# Rule 1

Never generate more than:
3-5 files at once.

---

# Rule 2

Always test after every module.

---

# Rule 3

Always commit changes frequently.

---

# Rule 4

Never continue huge uncontrolled context.

---

# Rule 5

Always preserve modular architecture.

---

# WHAT AI SHOULD ASK FROM USER

AI should ask user for:

* logos
* motor images
* business branding
* exact pricing
* GST details
* company details
* quotation wording
* recommendation preferences

AI should NOT repeatedly ask:

* architecture already documented
* already-defined business rules
* existing folder structure

---

# PROMPT STRUCTURE RULE

Every coding prompt should begin with:

IMPORTANT:

* Follow existing architecture strictly
* Read all docs before coding
* Do not rewrite unrelated files
* Keep code modular
* Keep code production-ready
* Mention required dependencies
* Mention assets needed from my side

---

# FINAL DEVELOPMENT STRATEGY

This project must evolve in this order:

1. Initialization
2. Config system
3. Calculation engine
4. Recommendation engine
5. APIs
6. Frontend foundation
7. Customer form
8. Quotation preview
9. PDF engine
10. Web Share API
11. PWA
12. Database
13. Deployment

NOT:
Trying to build everything simultaneously.

---

# END OF TASKS.md
