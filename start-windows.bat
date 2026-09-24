@echo off
REM Double-click to set up and run Loupe on Windows.
REM Runs in Command Prompt, so PowerShell's script policy doesn't apply.
cd /d "%~dp0"

where node >nul 2>nul || (echo Node.js is not installed. Get it from https://nodejs.org & pause & exit /b 1)
docker info >nul 2>nul || (echo Docker isn't running. Open Docker Desktop, wait for "Engine running", then run this again. & pause & exit /b 1)

if not exist .env copy .env.example .env >nul

if not exist node_modules (
  echo Installing packages... this takes a minute the first time.
  call npm.cmd install || (pause & exit /b 1)
)

echo Starting the database...
call npm.cmd run db:up || (pause & exit /b 1)

echo Waiting for the database to be ready...
set tries=0
:wait
set /a tries+=1
if %tries% gtr 30 (echo The database didn't start. In Docker Desktop, check the loupe container's logs. & pause & exit /b 1)
timeout /t 2 /nobreak >nul
call npm.cmd run db:migrate >nul 2>nul || goto wait
call npm.cmd run db:seed

echo.
echo Loupe is starting. Open http://localhost:3000 in your browser.
echo Demo accounts: alice / password123 and bob / password123
echo Press Ctrl+C in this window to stop.
echo.
call npm.cmd run dev
pause
