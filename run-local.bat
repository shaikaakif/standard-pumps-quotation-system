@echo off
echo ========================================================
echo   Standard Pumps Quotation System - Localhost Launcher
echo ========================================================
echo.
echo Starting Backend (FastAPI on http://localhost:8000)...
start "SPQS Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

echo Starting Frontend (Vite on http://localhost:5173)...
start "SPQS Frontend" cmd /k "npm --prefix frontend run dev"

echo.
echo Both servers are launching!
echo App will be accessible at: http://localhost:5173
echo Backend API docs at:       http://localhost:8000/docs
echo ========================================================
