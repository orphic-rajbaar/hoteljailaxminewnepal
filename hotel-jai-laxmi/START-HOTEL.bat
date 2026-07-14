@echo off
title Hotel Jai Laxmi and Lodge - Server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed on this computer!
  echo  Please download and install it from:  https://nodejs.org
  echo  Then double-click this file again.
  echo.
  start https://nodejs.org
  pause
  exit /b
)

if not exist node_modules (
  echo Installing... please wait 1-2 minutes ^(first time only^)
  call npm install --no-audit --no-fund
)

echo.
echo  ============================================
echo   Hotel Jai Laxmi ^& Lodge is starting...
echo   Website:  http://localhost:3000
echo   KEEP THIS WINDOW OPEN while using the site
echo  ============================================
echo.
start "" http://localhost:3000
node server.js
pause
