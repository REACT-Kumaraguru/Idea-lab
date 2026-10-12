@echo off
title Stop AICTE IDEA Lab Local Servers
color 0C

echo ===============================================================================
echo             AICTE IDEA LAB - STOPPING LOCAL SERVERS
echo ===============================================================================
echo.

echo Freeing port 5003 (Backend Server)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5003" ^| findstr "LISTENING"') do (
    echo Stopping process ID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo Freeing port 5205 (Frontend Client)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5205" ^| findstr "LISTENING"') do (
    echo Stopping process ID %%a...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ===============================================================================
echo  [DONE] Both Backend (5003) and Frontend (5205) servers have been stopped!
echo ===============================================================================
echo.
timeout /t 3 /nobreak >nul 2>&1 || ping 127.0.0.1 -n 4 >nul
