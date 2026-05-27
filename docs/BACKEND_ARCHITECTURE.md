# Backend Architecture & Service Orchestration

This document outlines the architecture, flow, and layer responsibilities of the Standard Pumps Quotation System backend. 

## 1. Architectural Philosophy
The backend is designed as a **Config-Driven Orchestration API**. Instead of hardcoding domain logic across fragmented services, the system relies on a tightly integrated execution core (`CalculationService`) powered dynamically by the centralized JSON configuration. 

This approach minimizes boilerplate, centralizes pricing logic, and ensures maximum stability when updating business rules (which are handled entirely through configuration rather than code refactoring).

## 2. Active Layer Responsibilities

### API Layer (`backend/app/api/`)
* **`quotation_routes.py`**: The primary orchestrator. Validates incoming requests, triggers the Calculation/Recommendation services, and maps the response into a frontend-ready JSON structure.
* **`history_routes.py`**: Exposes endpoints for the PWA history interface, returning persistent records of generated quotations from the local SQLite database.
* **`settings_routes.py`**: Provides the administrative endpoints (`GET/PUT`) for configuring shop details, UI text, and operational defaults dynamically.

### Core Services Layer (`backend/app/services/`)
* **`calculation_service.py` (`CalculationService`)**: The centralized mathematics engine. Handles pipe lengths, cable sizing, starter matching (scaled by motor HP), and fitting configurations. Pulls exclusively from `config_loader.py`.
* **`recommender.py` (`RecommendationService`)**: Contains the intelligent fallback and selection logic for submersible motors. Determines "Primary", "Budget", and "Premium" classifications dynamically based on borewell depth and user preference.
* **`history_service.py` (`HistoryService`)**: Manages the persistence lifecycle. Automatically saves generated quotations to the SQLite database.
* **`pdf_service.py` (`PDFService`)**: Encapsulates the HTML-to-PDF compilation engine using WeasyPrint, injecting custom Tailwind wrappers and print styles.

### Data Access Layer (`backend/app/database/`)
* **`db.py` & `models.py`**: Implements the SQLAlchemy engine and declarative base. The `QuotationHistory` model persists generated documents using a lightweight JSON-blob approach for maximum flexibility, combined with indexed snapshot columns for fast querying.
* **`settings_model.py`**: Single-row configuration model that drives the PWA branding customizations natively.

## 3. Orchestration Flow

When the frontend requests `/api/v1/quotation/generate`:
1. **Validation**: Pydantic schemas validate the depth, phase, and preferred brands.
2. **Execution**: `quotation_routes.py` calls the `CalculationService` and `RecommendationService` to select components.
3. **Synthesis**: Subtotals and discounts are calculated based on the active Material Mode.
4. **Persistence**: The full JSON representation is asynchronously passed to the `HistoryService` to be logged in SQLite.
5. **Response**: The API returns the completed metadata back to the frontend.

## 4. Consolidation Decisions
During Phase 10 (Architecture Audit), several initial scaffolding placeholders (e.g., `pipe_service.py`, `cable_service.py`) were permanently removed. 
Because the application is heavily config-driven, a fragmented architecture created unnecessary file clutter. The unified `CalculationService` provides superior clarity, making calculations atomic and significantly easier to test. Infrastructure placeholders (logging, security, etc.) are preserved with reserved docstrings for future expansion.
