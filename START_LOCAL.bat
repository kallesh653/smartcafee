@echo off
REM ============================================
REM Start Cold Drink System Locally
REM ============================================

title Cold Drink Billing System - Local Server
color 0A

echo.
echo  ╔════════════════════════════════════════════════════════╗
echo  ║                                                        ║
echo  ║         COLD DRINK BILLING SYSTEM                      ║
echo  ║              Local Development                         ║
echo  ║                                                        ║
echo  ╚════════════════════════════════════════════════════════╝
echo.

REM Check MongoDB Atlas Connection
echo [1/4] Checking MongoDB Atlas Connection...
echo       ✓ Using MongoDB Atlas (Cloud Database)
echo       ✓ No local MongoDB required
echo.

REM Start backend in new window
echo [2/4] Starting Backend Server...
start "Cold Drink - Backend (Port 8000)" cmd /k "cd /d %~dp0backend && echo Starting Backend... && npm run dev"
timeout /t 3 /nobreak >nul
echo       ✓ Backend starting on http://localhost:8000
echo.

REM Start frontend in new window
echo [3/4] Starting Frontend Server...
start "Cold Drink - Frontend (Port 8080)" cmd /k "cd /d %~dp0frontend && echo Starting Frontend... && npm run dev"
timeout /t 3 /nobreak >nul
echo       ✓ Frontend starting on http://localhost:8080
echo.

REM Wait for servers to start
echo [4/4] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul
echo       ✓ Servers initialized
echo.

echo  ╔════════════════════════════════════════════════════════╗
echo  ║                                                        ║
echo  ║              SERVERS ARE RUNNING!                      ║
echo  ║                                                        ║
echo  ╚════════════════════════════════════════════════════════╝
echo.
echo  Access your application:
echo  ─────────────────────────────────────────────────────────
echo  Frontend:  http://localhost:8080
echo  Backend:   http://localhost:8000/api/health
echo  MongoDB:   MongoDB Atlas (Cloud Database)
echo.
echo  ─────────────────────────────────────────────────────────
echo  Login Credentials:
echo  ─────────────────────────────────────────────────────────
echo  Username: admin
echo  Password: admin123
echo  ─────────────────────────────────────────────────────────
echo.
echo  NOTE: If login fails, run "FIRST TIME SETUP.bat" first!
echo.
echo  Press any key to open the application in browser...
pause >nul

REM Open browser
start http://localhost:8080

echo.
echo  Application opened in browser!
echo  Keep this window and the server windows open.
echo.
echo  To stop servers: Close all server windows or press Ctrl+C
echo.
pause
