``md
# STANDARD PUMPS QUOTATION SYSTEM

## Project Overview

This project is a full-stack AI-assisted quotation automation system for a borewell and motor shop.

The system automates:
- borewell quotation generation
- motor recommendation
- pipe calculations
- cable calculations
- starter selection
- fitting charge calculations
- PDF quotation generation
- Web Share API integration
- PWA installation
- quotation history

The system replaces handwritten quotations with professional digital quotations.

---

# Primary Goal

To create a professional mobile-first quotation generation system for Standard Pumps and Borewell.

---

# Business Workflow

Customer enters shop
↓
Shopkeeper enters bore feet and customer details
↓
System automatically:
- selects pipe
- selects cable
- selects motor
- calculates totals
- generates quotation preview
↓
User can:
- download PDF
- share quotation
- share on WhatsApp
- save quotation

---

# Technology Stack

## Frontend
- React
- Vite
- TailwindCSS
- Framer Motion
- React Icons
- vite-plugin-pwa

## Backend
- Python
- FastAPI
- SQLite
- Jinja2
- WeasyPrint

## Deployment
- Vercel (Frontend)
- Railway (Backend)

---

# Important Business Rules

## Feet to Meter Conversion

meters = feet / 3.28

---

## Cable Extra Length

Cable length always includes:
+10 meters extra

Reason:
- flexibility
- installation slack
- fitting convenience

---

# UI Philosophy

The UI should feel:
- professional
- premium
- business-oriented
- hardware-shop realistic
- trustworthy

NOT:
- futuristic
- gaming style
- over animated
- cyberpunk

---

# Target Users

- hardware shop owners
- borewell service providers
- technicians
- contractors
- farmers
- domestic customers

---

# Core Features

- quotation preview
- quotation PDF export
- Web Share API
- WhatsApp share
- live calculations
- motor comparison
- recommendation system
- quotation history
- PWA installation
- offline support

---

# Design Philosophy

Professional business quotation aesthetic.

Combination of:
- invoice systems
- fintech dashboards
- hardware business branding
- modern ERP UI

---

# Important Notes

This project is developed using AI-assisted engineering workflow.

AI is used for:
- implementation
- code generation
- debugging
- scaffolding
- architecture assistance

Human role:
- business logic
- workflow design
- architecture direction
- product decisions
```

---
---

# IMPORTANT PROJECT DECISIONS

## Architecture

Decision:
Frontend + Backend + Config separation.

Reason:
Maintainability.

---

## Share System

Decision:
Use Web Share API.

Reason:
No WhatsApp Business API cost.

---

## UI Philosophy

Decision:
Professional business quotation.

Reason:
Target audience trust.

---

## Config Driven System

Decision:
Store pricing in JSON configs.

Reason:
Easy future updates.

---

## PDF Generation

Decision:
HTML to PDF.

Reason:
Better styling and maintainability.
```
