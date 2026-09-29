@echo off
title PulseCRM - Local SQLite CRM
cd /d "%~dp0"

echo ========================================================
echo               PulseCRM - Local SQLite3 CRM               
echo ========================================================
echo.
echo Starting local Express server and SQLite3 database...
echo Database file: %~dp0crm.db
echo.

REM Launch browser in 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

REM Run server
node server/index.js

pause
