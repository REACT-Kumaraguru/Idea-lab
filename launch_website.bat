@echo off
setlocal enabledelayedexpansion
title AICTE IDEA Lab - Local Portal Launcher

color 0A

echo ===============================================================================
echo            AICTE IDEA LAB and SMART CITY HACKATHON 2026
echo                       Local Portal Launcher
echo ===============================================================================
echo.

:: 1. Navigate to the project root directory
cd /d "%~dp0"
echo [1/5] Working directory: "%CD%"

:: 2. Check Node.js and npm installation
echo.
echo [2/5] Checking prerequisites: Node.js and npm...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] Node.js was not found in your system PATH!
    echo Please install Node.js v18 or higher from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo [ERROR] npm was not found in your system PATH!
    echo Please verify your Node.js installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
for /f "tokens=*" %%v in ('npm -v') do set NPM_VERSION=%%v
echo       Node.js Version: !NODE_VERSION!
echo       npm Version:     !NPM_VERSION!

:: 3. Check and install dependencies if node_modules missing
echo.
echo [3/5] Verifying project dependencies...
if not exist "backend\node_modules\" (
    echo       Installing backend packages...
    cd /d "%~dp0backend"
    call npm install
    cd /d "%~dp0"
) else (
    echo       Backend packages: OK
)

if not exist "frontend\node_modules\" (
    echo       Installing frontend packages...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
) else (
    echo       Frontend packages: OK
)

:: 4. Free up existing ports if already occupied
echo.
echo [4/5] Checking ports 5003 [Backend] and 5205 [Frontend]...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5003" ^| findstr "LISTENING"') do (
    echo       Freeing port 5003 [Process ID %%a]...
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5205" ^| findstr "LISTENING"') do (
    echo       Freeing port 5205 [Process ID %%a]...
    taskkill /f /pid %%a >nul 2>&1
)

:: 5. Launch Backend and Frontend in separate windows
echo.
echo [5/5] Launching server processes...
echo       Starting Backend Server on http://localhost:5003 ...
start "IDEA Lab - Backend Server (Port 5003)" /D "%~dp0backend" cmd /k "echo Starting Backend on port 5003... && node server.js"

echo       Starting Frontend Client on http://localhost:5205 ...
start "IDEA Lab - Frontend Client (Port 5205)" /D "%~dp0frontend" cmd /k "echo Starting Frontend on port 5205... && npm run dev"

:: Wait for servers to spin up
echo.
echo Waiting 6 seconds for backend and frontend services to initialize...
timeout /t 6 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 7 >nul

:: Automatically open browser
echo.
echo Opening browser to http://localhost:5205 ...
start http://localhost:5205

echo.
echo ===============================================================================
echo                     SERVICES ARE NOW RUNNING LOCALLY!
echo ===============================================================================
echo.
echo   * Main Portal / Student Catalog:  http://localhost:5205
echo   * Admin Dashboard:                http://localhost:5205/admin
echo   * System Health Diagnostics:      http://localhost:5205/admin/system-health
echo   * Hackathon 2026 Portal:          http://localhost:5205/hackathon
echo   * Backend REST API:               http://localhost:5003/api
echo.
echo   -----------------------------------------------------------------------------
echo   Default Credentials:
echo   * Admin Login:    idealab@kct.ac.in    Password:  idealab-kct
echo   * Student Login:  student@kct.ac.in    Password:  studentpass123
echo   -----------------------------------------------------------------------------
echo.
echo   Keep the Backend and Frontend command windows open while using the app.
echo   To stop all servers, close their command windows or run "stop_website.bat".
echo ===============================================================================
echo.
pause
