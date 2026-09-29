@echo off
title PulseCRM Dev Mode
cd /d "%~dp0"

echo ========================================================
echo        PulseCRM - Vite + React Development Mode        
echo ========================================================
echo.
echo Starting Express API (port 5000) and Vite React (port 3000)...
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

npm.cmd run dev
